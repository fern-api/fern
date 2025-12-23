// ReSharper disable All
#pragma warning disable
using System.Net.WebSockets;
using System.Text;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.IO;
using SeedWebsocketParameterName.Core.Async.Exceptions;
using SeedWebsocketParameterName.Core.Async.Models;
using SeedWebsocketParameterName.Core.Async.Threading;

namespace SeedWebsocketParameterName.Core.Async;

/// <summary>
/// A simple websocket client with built-in reconnection and error handling
/// </summary>
internal partial class WebSocketConnection
{
    private readonly ILogger<WebSocketConnection> _logger;
    private readonly AsyncLock _locker = new AsyncLock();
    private readonly Func<
        Uri,
        CancellationToken,
        Task<System.Net.WebSockets.WebSocket>
    > _connectionFactory;

    private static readonly RecyclableMemoryStreamManager _memoryStreamManager =
        new RecyclableMemoryStreamManager();

    private Timer _lastChanceTimer;

    private Timer _errorReconnectTimer;

    private bool _disposing;
    private bool _reconnecting;
    private bool _stopping;
    private bool _isReconnectionEnabled = true;
    private WebSocket _client;
    private CancellationTokenSource _cancellation;
    private CancellationTokenSource _cancellationTotal;

    /// <summary>
    /// A simple websocket client with built-in reconnection and error handling
    /// </summary>
    /// <param name="url">Target websocket url (wss://)</param>
    /// <param name="clientFactory">Optional factory for native ClientWebSocket, use it whenever you need some custom features (proxy, settings, etc)</param>
    public WebSocketConnection(Uri url, Func<ClientWebSocket>? clientFactory = null)
        : this(url, null, GetClientFactory(clientFactory)) { }

    /// <summary>
    /// A simple websocket client with built-in reconnection and error handling
    /// </summary>
    /// <param name="url">Target websocket url (wss://)</param>
    /// <param name="logger">Logger instance, can be null</param>
    /// <param name="clientFactory">Optional factory for native ClientWebSocket, use it whenever you need some custom features (proxy, settings, etc)</param>
    public WebSocketConnection(
        Uri url,
        ILogger<WebSocketConnection> logger,
        Func<ClientWebSocket>? clientFactory = null
    )
        : this(url, logger, GetClientFactory(clientFactory)) { }

    /// <summary>
    /// A simple websocket client with built-in reconnection and error handling
    /// </summary>
    /// <param name="url">Target websocket url (wss://)</param>
    /// <param name="logger">Logger instance, can be null</param>
    /// <param name="connectionFactory">Optional factory for native creating and connecting to a websocket. The method should return a <see cref="WebSocket"/> which is connected. Use it whenever you need some custom features (proxy, settings, etc)</param>
    public WebSocketConnection(
        Uri url,
        ILogger<WebSocketConnection> logger,
        Func<Uri, CancellationToken, Task<WebSocket>> connectionFactory
    )
    {
        _logger = logger ?? NullLogger<WebSocketConnection>.Instance;
        Url = url;
        _connectionFactory =
            connectionFactory
            ?? (
                async (uri, token) =>
                {
                    //var client = new ClientWebSocket
                    //{
                    //    Options = { KeepAliveInterval = new TimeSpan(0, 0, 5, 0) }
                    //};
                    var client = new ClientWebSocket();
                    await client.ConnectAsync(uri, token).ConfigureAwait(false);
                    return client;
                }
            );
    }

    public Uri Url { get; set; }

    public Func<Stream, Task>? TextMessageReceived { get; set; }
    public Func<Stream, Task>? BinaryMessageReceived { get; set; }
    public Func<DisconnectionInfo, Task>? DisconnectionHappened { get; set; }
    public Func<Exception, Task>? ExceptionOccurred { get; set; }

    private Task OnTextMessageReceived(Stream stream) =>
        TextMessageReceived == null ? Task.CompletedTask : TextMessageReceived.Invoke(stream);

    private Task OnBinaryMessageReceived(Stream stream) =>
        BinaryMessageReceived == null ? Task.CompletedTask : BinaryMessageReceived.Invoke(stream);

    private Task OnDisconnectionHappened(DisconnectionInfo info) =>
        DisconnectionHappened == null ? Task.CompletedTask : DisconnectionHappened.Invoke(info);

    private Task OnExceptionOccurred(Exception exception) =>
        ExceptionOccurred == null ? Task.CompletedTask : ExceptionOccurred.Invoke(exception);

    /// <summary>
    /// Get or set the name of the current websocket client instance.
    /// For logging purpose (in case you use more parallel websocket clients and want to distinguish between them)
    /// </summary>
    public string Name { get; set; }

    /// <summary>
    /// Returns true if Start() method was called at least once. False if not started or disposed
    /// </summary>
    public bool IsStarted { get; private set; }

    /// <summary>
    /// Returns true if client is running and connected to the server
    /// </summary>
    public bool IsRunning { get; private set; }

    /// <summary>
    /// Enable or disable text message conversion from binary to string (via 'MessageEncoding' property).
    /// Default: true
    /// </summary>
    public bool IsTextMessageConversionEnabled { get; set; } = true;

    /// <summary>
    /// Enable or disable automatic <see cref="MemoryStream.Dispose(bool)"/> of the <see cref="MemoryStream"/>
    /// after sending data (only available for binary response).
    /// Setting value to false allows you to access the stream directly.
    /// <warning>However, keep in mind that you need to handle the dispose yourself.</warning>
    /// Default: true
    /// </summary>
    public bool IsStreamDisposedAutomatically { get; set; } = true;

    public Encoding MessageEncoding { get; set; }

    public ClientWebSocket NativeClient => GetSpecificOrThrow(_client);

    /// <summary>
    /// Terminate the websocket connection and cleanup everything
    /// </summary>
    public void Dispose()
    {
        _disposing = true;
        try
        {
            _lastChanceTimer?.Dispose();
            _errorReconnectTimer?.Dispose();
            _cancellation?.Cancel();
            _cancellationTotal?.Cancel();
            _client?.Abort();
            _client?.Dispose();
            _cancellation?.Dispose();
            _cancellationTotal?.Dispose();
        }
        catch (Exception)
        {
            // ignored
        }

        if (IsRunning)
        {
            OnDisconnectionHappened(
                DisconnectionInfo.Create(DisconnectionType.Exit, _client, null)
            );
        }

        IsRunning = false;
        IsStarted = false;
    }

    /// <summary>
    /// Start listening to the websocket stream on the background thread.
    /// In case of connection error it doesn't throw an exception.
    /// Only streams a message via 'DisconnectionHappened' and logs it.
    /// </summary>
    public Task Start()
    {
        return StartInternal(false);
    }

    /// <summary>
    /// Start listening to the websocket stream on the background thread.
    /// In case of connection error it throws an exception.
    /// Fail fast approach.
    /// </summary>
    public Task StartOrFail()
    {
        return StartInternal(true);
    }

    /// <summary>
    /// Stop/close websocket connection with custom close code.
    /// Method doesn't throw exception, only logs it and mark client as closed.
    /// </summary>
    /// <returns>Returns true if close was initiated successfully</returns>
    public async Task<bool> Stop(WebSocketCloseStatus status, string statusDescription)
    {
        var result = await StopInternal(_client, status, statusDescription, null, false, false)
            .ConfigureAwait(false);
        OnDisconnectionHappened(DisconnectionInfo.Create(DisconnectionType.ByUser, _client, null));
        return result;
    }

    /// <summary>
    /// Stop/close websocket connection with custom close code.
    /// Method could throw exceptions, but client is marked as closed anyway.
    /// </summary>
    /// <returns>Returns true if close was initiated successfully</returns>
    public async Task<bool> StopOrFail(WebSocketCloseStatus status, string statusDescription)
    {
        var result = await StopInternal(_client, status, statusDescription, null, true, false)
            .ConfigureAwait(false);
        OnDisconnectionHappened(DisconnectionInfo.Create(DisconnectionType.ByUser, _client, null));
        return result;
    }

    private static Func<Uri, CancellationToken, Task<WebSocket>> GetClientFactory(
        Func<ClientWebSocket> clientFactory
    )
    {
        if (clientFactory == null)
            return null;

        return (
            async (uri, token) =>
            {
                var client = clientFactory();
                await client.ConnectAsync(uri, token).ConfigureAwait(false);
                return client;
            }
        );
    }

    private async Task StartInternal(bool failFast)
    {
        if (_disposing)
        {
            throw new WebsocketException(
                $"Client {Name} is already disposed, starting not possible"
            );
        }

        if (IsStarted)
        {
            return;
        }

        IsStarted = true;

        _cancellation = new CancellationTokenSource();
        _cancellationTotal = new CancellationTokenSource();

        await StartClient(Url, _cancellation.Token).ConfigureAwait(false);
    }

    private async Task<bool> StopInternal(
        WebSocket client,
        WebSocketCloseStatus status,
        string statusDescription,
        CancellationToken? cancellation,
        bool failFast,
        bool byServer
    )
    {
        if (_disposing)
        {
            throw new WebsocketException(
                $"Client {Name} is already disposed, stopping not possible"
            );
        }

        if (client == null)
        {
            IsStarted = false;
            IsRunning = false;
            return false;
        }

        if (!IsRunning)
        {
            IsStarted = false;
            return false;
        }

        var result = false;
        try
        {
            var cancellationToken = cancellation ?? CancellationToken.None;
            _stopping = true;
            if (byServer)
                await client.CloseOutputAsync(status, statusDescription, cancellationToken);
            else
                await client.CloseAsync(status, statusDescription, cancellationToken);
            result = true;
        }
        finally
        {
            IsRunning = false;
            _stopping = false;

            if (!byServer)
            {
                // stopped manually or no reconnection, mark client as non-started
                IsStarted = false;
            }
        }

        return result;
    }

    private async Task StartClient(Uri uri, CancellationToken token)
    {
        _client = await _connectionFactory(uri, token).ConfigureAwait(false);
        _ = Listen(_client, token);
        IsRunning = true;
        IsStarted = true;
    }

    private bool IsClientConnected()
    {
        return _client?.State == WebSocketState.Open;
    }

    internal Exception ListenException { get; set; }

    private async Task Listen(WebSocket client, CancellationToken token)
    {
        try
        {
            // define buffer here and reuse, to avoid more allocation
            const int chunkSize = 4096;
            var buffer = new ArraySegment<byte>(new byte[chunkSize]);

            do
            {
                using (var ms = _memoryStreamManager.GetStream())
                {
                    WebSocketReceiveResult result;
                    while (true)
                    {
                        result = await client.ReceiveAsync(buffer, token);
                        ms.Write(buffer.AsSpan(0, result.Count));

                        if (result.EndOfMessage)
                            break;
                    }

                    ms.Seek(0, SeekOrigin.Begin);

                    switch (result.MessageType)
                    {
                        case WebSocketMessageType.Text:
                            await OnTextMessageReceived(ms).ConfigureAwait(false);
                            break;
                        case WebSocketMessageType.Binary:
                            await OnBinaryMessageReceived(ms).ConfigureAwait(false);
                            break;
                        case WebSocketMessageType.Close:
                        {
                            var info = DisconnectionInfo.Create(
                                DisconnectionType.ByServer,
                                client,
                                null
                            );
                            await OnDisconnectionHappened(info).ConfigureAwait(false);

                            await StopInternal(
                                client,
                                WebSocketCloseStatus.NormalClosure,
                                "Closing",
                                token,
                                false,
                                true
                            );

                            return;
                        }
                    }
                }
            } while (client.State == WebSocketState.Open && !token.IsCancellationRequested);
        }
        catch (TaskCanceledException e)
        {
            // task was canceled, ignore
        }
        catch (OperationCanceledException e)
        {
            // operation was canceled, ignore
        }
        catch (ObjectDisposedException e)
        {
            // client was disposed, ignore
        }
        catch (Exception e)
        {
            _logger.LogError(
                e,
                "Error while listening to WebSocket stream, error: '{error}'",
                e.Message
            );
            await OnExceptionOccurred(e).ConfigureAwait(false);
        }
    }

    private ClientWebSocket GetSpecificOrThrow(WebSocket client)
    {
        if (client == null)
            return null;
        var specific = client as ClientWebSocket;
        if (specific == null)
            throw new WebsocketException(
                "Cannot cast 'WebSocket' client to 'ClientWebSocket', "
                    + "provide correct type via factory or don't use this property at all."
            );
        return specific;
    }
}
