// ReSharper disable All
#pragma warning disable
using global::System.Net.WebSockets;
using global::System.Text;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.IO;

namespace <%= namespace%>.WebSockets;

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
        global::System.Threading.Tasks.Task<System.Net.WebSockets.WebSocket>
    > _connectionFactory;

    private static readonly RecyclableMemoryStreamManager _memoryStreamManager =
        new RecyclableMemoryStreamManager();

    private Timer _lastChanceTimer;

    private Timer _errorReconnectTimer;

    private DateTime _lastReceivedMsg = DateTime.UtcNow;

    private bool _disposing;
    private bool _reconnecting;
    private bool _stopping;
    private bool _isReconnectionEnabled;

    /// <summary>
    /// Enable or disable automatic reconnection. Default: false.
    /// </summary>
    public bool IsReconnectionEnabled
    {
        get => _isReconnectionEnabled;
        set => _isReconnectionEnabled = value;
    }

    private WebSocket _client;
    private CancellationTokenSource _cancellation;
    private CancellationTokenSource _cancellationConnection;
    private CancellationTokenSource _cancellationTotal;
    private readonly Func<ClientWebSocket>? _clientFactory;

    /// <summary>
    /// A simple websocket client with built-in reconnection and error handling
    /// </summary>
    /// <param name="url">Target websocket url (wss://)</param>
    /// <param name="clientFactory">Optional factory for native ClientWebSocket, use it whenever you need some custom features (proxy, settings, etc). Note: when providing a factory, you are responsible for configuring keep-alive on the returned ClientWebSocket instance.</param>
    public WebSocketConnection(Uri url, Func<ClientWebSocket>? clientFactory = null)
        : this(url, null, null, clientFactory) { }

    /// <summary>
    /// A simple websocket client with built-in reconnection and error handling
    /// </summary>
    /// <param name="url">Target websocket url (wss://)</param>
    /// <param name="logger">Logger instance, can be null</param>
    /// <param name="clientFactory">Optional factory for native ClientWebSocket, use it whenever you need some custom features (proxy, settings, etc). Note: when providing a factory, you are responsible for configuring keep-alive on the returned ClientWebSocket instance.</param>
    public WebSocketConnection(
        Uri url,
        ILogger<WebSocketConnection> logger,
        Func<ClientWebSocket>? clientFactory = null
    )
        : this(url, logger, null, clientFactory) { }

    /// <summary>
    /// A simple websocket client with built-in reconnection and error handling
    /// </summary>
    /// <param name="url">Target websocket url (wss://)</param>
    /// <param name="logger">Logger instance, can be null</param>
    /// <param name="connectionFactory">Optional factory for native creating and connecting to a websocket. The method should return a <see cref="WebSocket"/> which is connected. Use it whenever you need some custom features (proxy, settings, etc)</param>
    public WebSocketConnection(
        Uri url,
        ILogger<WebSocketConnection> logger,
        Func<Uri, CancellationToken, global::System.Threading.Tasks.Task<WebSocket>> connectionFactory
    )
        : this(url, logger, connectionFactory, null) { }

    private WebSocketConnection(
        Uri url,
        ILogger<WebSocketConnection> logger,
        Func<Uri, CancellationToken, global::System.Threading.Tasks.Task<WebSocket>> connectionFactory,
        Func<ClientWebSocket>? clientFactory
    )
    {
        _logger = logger ?? NullLogger<WebSocketConnection>.Instance;
        Url = url;
        _clientFactory = clientFactory;
        _connectionFactory =
            connectionFactory
            ?? (
                async (uri, token) =>
                {
                    var client = _clientFactory != null ? _clientFactory() : new ClientWebSocket();
                    client.Options.KeepAliveInterval = KeepAliveInterval;
#if NET6_0_OR_GREATER
                    if (DeflateOptions != null)
                    {
                        client.Options.DangerousDeflateOptions = DeflateOptions;
                    }
#endif
#if NET9_0_OR_GREATER
                    client.Options.KeepAliveTimeout = KeepAliveTimeout;
#endif
                    if (HttpInvoker != null)
                    {
#if NET7_0_OR_GREATER
                        client.Options.HttpVersion = System.Net.HttpVersion.Version20;
                        client.Options.HttpVersionPolicy = System.Net.Http.HttpVersionPolicy.RequestVersionOrHigher;
                        await client.ConnectAsync(uri, HttpInvoker, token).ConfigureAwait(false);
#else
                        await client.ConnectAsync(uri, token).ConfigureAwait(false);
#endif
                    }
                    else
                    {
                        await client.ConnectAsync(uri, token).ConfigureAwait(false);
                    }
                    return client;
                }
            );
    }

    public Uri Url { get; set; }

    /// <summary>
    /// Optional HttpMessageInvoker for HTTP/2 WebSocket connections.
    /// When set, enables multiplexing multiple WebSocket streams over a single TCP connection.
    /// Requires .NET 7+.
    /// </summary>
    public System.Net.Http.HttpMessageInvoker? HttpInvoker { get; set; }

    /// <summary>
    /// Interval for sending keep-alive frames. Default: 30 seconds.
    /// Set to TimeSpan.Zero to disable keep-alive.
    /// </summary>
    public TimeSpan KeepAliveInterval { get; set; } = WebSocket.DefaultKeepAliveInterval;

    /// <summary>
    /// Timeout for expecting a PONG response to a PING keep-alive frame (.NET 9+).
    /// Set to a positive finite TimeSpan to enable PING/PONG keep-alive strategy.
    /// Default: 20 seconds.
    /// </summary>
    public TimeSpan KeepAliveTimeout { get; set; } = TimeSpan.FromSeconds(20);

    /// <summary>
    /// Time range for how long to wait before reconnecting if no message comes from server.
    /// Set null to disable. Default: 1 minute.
    /// </summary>
    public TimeSpan? ReconnectTimeout { get; set; } = TimeSpan.FromMinutes(1);

    /// <summary>
    /// Time range for how long to wait before reconnecting if last reconnection failed.
    /// Set null to disable. Default: 1 minute.
    /// </summary>
    public TimeSpan? ErrorReconnectTimeout { get; set; } = TimeSpan.FromMinutes(1);

    /// <summary>
    /// Time range for how long to wait before reconnecting if connection is lost with a transient error.
    /// Set null to disable. Default: null/disabled (reconnect immediately).
    /// </summary>
    public TimeSpan? LostReconnectTimeout { get; set; }

    /// <summary>
    /// Maximum time to wait for a single SendAsync call to complete.
    /// Prevents indefinite hangs when the remote peer dies without closing the connection.
    /// See: https://github.com/dotnet/runtime/issues/125257
    /// Default: 30 seconds.
    /// </summary>
    public TimeSpan SendTimeout { get; set; } = TimeSpan.FromSeconds(30);

    /// <summary>
    /// How often to check the WebSocket state for silent disconnections.
    /// Addresses ReceiveAsync hang when TCP closes without WebSocket notification.
    /// See: https://github.com/dotnet/runtime/issues/110496
    /// Set to null to disable. Default: 5 seconds.
    /// </summary>
    public TimeSpan? StateCheckInterval { get; set; } = TimeSpan.FromSeconds(5);

#if NET6_0_OR_GREATER
    /// <summary>
    /// Optional per-message deflate compression options (RFC 7692).
    /// When set, the <see cref="ClientWebSocket" /> created by the default connection factory
    /// assigns this value to <see cref="ClientWebSocketOptions.DangerousDeflateOptions" />.
    /// Compression is negotiated during the WebSocket handshake; if the server does not
    /// support it, the connection proceeds without compression.
    /// <para>
    /// <b>Security warning:</b> Do not enable compression when transmitting data that
    /// contains secrets. Compressed encrypted payloads are vulnerable to CRIME/BREACH
    /// side-channel attacks.
    /// See <see href="https://learn.microsoft.com/dotnet/api/system.net.websockets.clientwebsocketoptions.dangerousdeflateoptions">
    /// ClientWebSocketOptions.DangerousDeflateOptions</see> for details.
    /// </para>
    /// </summary>
    public WebSocketDeflateOptions? DeflateOptions { get; set; }
#endif

    public Func<Stream, global::System.Threading.Tasks.Task>? TextMessageReceived { get; set; }
    public Func<Stream, global::System.Threading.Tasks.Task>? BinaryMessageReceived { get; set; }
    public Func<DisconnectionInfo, global::System.Threading.Tasks.Task>? DisconnectionHappened { get; set; }
    public Func<Exception, global::System.Threading.Tasks.Task>? ExceptionOccurred { get; set; }
    public Func<ReconnectionInfo, global::System.Threading.Tasks.Task>? ReconnectionHappened { get; set; }

    private global::System.Threading.Tasks.Task OnTextMessageReceived(Stream stream) =>
        TextMessageReceived is null ? global::System.Threading.Tasks.Task.CompletedTask : TextMessageReceived.Invoke(stream);

    private global::System.Threading.Tasks.Task OnBinaryMessageReceived(Stream stream) =>
        BinaryMessageReceived is null ? global::System.Threading.Tasks.Task.CompletedTask : BinaryMessageReceived.Invoke(stream);

    private global::System.Threading.Tasks.Task OnDisconnectionHappened(DisconnectionInfo info) =>
        DisconnectionHappened is null ? global::System.Threading.Tasks.Task.CompletedTask : DisconnectionHappened.Invoke(info);

    private global::System.Threading.Tasks.Task OnExceptionOccurred(Exception exception) =>
        ExceptionOccurred is null ? global::System.Threading.Tasks.Task.CompletedTask : ExceptionOccurred.Invoke(exception);

    private global::System.Threading.Tasks.Task OnReconnectionHappened(ReconnectionInfo info) =>
        ReconnectionHappened is null ? global::System.Threading.Tasks.Task.CompletedTask : ReconnectionHappened.Invoke(info);

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
    /// Maximum number of messages allowed in the send queue.
    /// When the queue is full, new messages are silently dropped (DropWrite).
    /// Default: 10,000. Set to 0 for unbounded.
    /// </summary>
    public int SendQueueLimit { get; set; } = 10_000;

    /// <summary>
    /// Maximum age for messages in the send queue.
    /// Messages older than this are silently dropped during drain.
    /// Default: 30 minutes. Set to null to disable expiration.
    /// </summary>
    public TimeSpan? SendCacheItemTimeout { get; set; } = TimeSpan.FromMinutes(30);

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

    /// <summary>
    /// Time range for how long to wait while connecting.
    /// Default: 5 seconds.
    /// </summary>
    public TimeSpan ConnectTimeout { get; set; } = TimeSpan.FromSeconds(5);

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
            _textSendQueue?.Writer.TryComplete();
            _binarySendQueue?.Writer.TryComplete();
            _cancellationConnection?.Cancel();
            _cancellation?.Cancel();
            _client?.Abort();
            _cancellationTotal?.Cancel();
            _client?.Dispose();
            _cancellationConnection?.Dispose();
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
    public global::System.Threading.Tasks.Task Start()
    {
        return StartInternal(false);
    }

    /// <summary>
    /// Start listening to the websocket stream on the background thread.
    /// In case of connection error it throws an exception.
    /// Fail fast approach.
    /// </summary>
    public global::System.Threading.Tasks.Task StartOrFail(CancellationToken cancellationToken = default)
    {
        return StartInternal(true, cancellationToken);
    }

    /// <summary>
    /// Stop/close websocket connection with custom close code.
    /// Method doesn't throw exception, only logs it and mark client as closed.
    /// </summary>
    /// <returns>Returns true if close was initiated successfully</returns>
    public async global::System.Threading.Tasks.Task<bool> Stop(WebSocketCloseStatus status, string statusDescription)
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
    public async global::System.Threading.Tasks.Task<bool> StopOrFail(WebSocketCloseStatus status, string statusDescription, CancellationToken cancellationToken = default)
    {
        var result = await StopInternal(_client, status, statusDescription, cancellationToken, true, false)
            .ConfigureAwait(false);
        OnDisconnectionHappened(DisconnectionInfo.Create(DisconnectionType.ByUser, _client, null));
        return result;
    }

    private async global::System.Threading.Tasks.Task StartInternal(bool failFast, CancellationToken cancellationToken = default)
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

        _cancellation = cancellationToken != default
            ? CancellationTokenSource.CreateLinkedTokenSource(cancellationToken)
            : new CancellationTokenSource();
        _cancellationTotal = new CancellationTokenSource();

        InitializeSendQueues();

        await StartClient(Url, _cancellation.Token, failFast).ConfigureAwait(false);

        _ = global::System.Threading.Tasks.Task.Run(
            () => DrainTextQueue(_cancellationTotal.Token));

        _ = global::System.Threading.Tasks.Task.Run(
            () => DrainBinaryQueue(_cancellationTotal.Token));
    }

    private async global::System.Threading.Tasks.Task<bool> StopInternal(
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

        if (client is null)
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

    private async global::System.Threading.Tasks.Task StartClient(
        Uri uri, CancellationToken token, bool failFast = false)
    {
        DeactivateLastChance();
        try
        {
            _cancellationConnection = CancellationTokenSource.CreateLinkedTokenSource(token);
            _cancellationConnection.CancelAfter(ConnectTimeout);
            _client = await _connectionFactory(uri, _cancellationConnection.Token).ConfigureAwait(false);
            _ = Listen(_client, token);
            IsRunning = true;
            IsStarted = true;
            _lastReceivedMsg = DateTime.UtcNow;
            ActivateLastChance();
        }
        catch (Exception e)
        {
            IsRunning = _client?.State == WebSocketState.Open;
            var info = DisconnectionInfo.Create(DisconnectionType.Error, _client, e);
            await OnDisconnectionHappened(info).ConfigureAwait(false);

            if (failFast) throw;

            if (info.CancelReconnection) return;

            if (ErrorReconnectTimeout == null) return;

            var timeout = ErrorReconnectTimeout.Value;
            _errorReconnectTimer?.Dispose();
            _errorReconnectTimer = new Timer(
                _ =>
                {
                    if (_client != null && ShouldIgnoreReconnection(_client)) return;
                    _ = ReconnectSynchronized(ReconnectionType.Error, false, e);
                },
                null, timeout, Timeout.InfiniteTimeSpan);
        }
    }

    private bool IsClientConnected()
    {
        return _client?.State == WebSocketState.Open;
    }

    internal Exception ListenException { get; set; }

    private async global::System.Threading.Tasks.Task MonitorState(
        WebSocket client, CancellationTokenSource receiveCts)
    {
        if (StateCheckInterval == null) return;

        try
        {
            while (!receiveCts.Token.IsCancellationRequested)
            {
                await global::System.Threading.Tasks.Task.Delay(
                    StateCheckInterval.Value, receiveCts.Token).ConfigureAwait(false);

                if (client.State == WebSocketState.Closed ||
                    client.State == WebSocketState.Aborted ||
                    client.State == WebSocketState.CloseReceived)
                {
                    _logger.LogWarning(
                        "State monitor detected WebSocket in '{State}' state, "
                        + "cancelling receive loop",
                        client.State);

                    // Cancel the ReceiveAsync that may be hung
                    receiveCts.Cancel();
                    return;
                }
            }
        }
        catch (OperationCanceledException) { }
        catch (ObjectDisposedException) { }
    }

    private async global::System.Threading.Tasks.Task Listen(WebSocket client, CancellationToken token)
    {
        // Create a linked CTS that the state monitor can cancel
        using var receiveCts = CancellationTokenSource.CreateLinkedTokenSource(token);

        // Start the state monitor as a background task
        var monitorTask = MonitorState(client, receiveCts);

        Exception causedException = null;
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
                        result = await client.ReceiveAsync(buffer, receiveCts.Token);
                        ms.Write(buffer.AsSpan(0, result.Count));

                        if (result.EndOfMessage)
                            break;
                    }

                    ms.Seek(0, SeekOrigin.Begin);

                    switch (result.MessageType)
                    {
                        case WebSocketMessageType.Text:
                            _lastReceivedMsg = DateTime.UtcNow;
                            await OnTextMessageReceived(ms).ConfigureAwait(false);
                            break;
                        case WebSocketMessageType.Binary:
                            _lastReceivedMsg = DateTime.UtcNow;
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
            } while (client.State == WebSocketState.Open && !receiveCts.Token.IsCancellationRequested);
        }
        catch (TaskCanceledException)
        {
            // task was canceled, ignore
        }
        catch (OperationCanceledException)
        {
            // operation was canceled, ignore
        }
        catch (ObjectDisposedException)
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
            causedException = e;
        }
        finally
        {
            // Ensure monitor task completes
            receiveCts.Cancel();
            try { await monitorTask.ConfigureAwait(false); } catch { }
        }

        if (ShouldIgnoreReconnection(client) || !IsStarted)
        {
            return;
        }

        if (LostReconnectTimeout.HasValue)
        {
            try
            {
                await global::System.Threading.Tasks.Task.Delay(
                    LostReconnectTimeout.Value, token).ConfigureAwait(false);
            }
            catch (OperationCanceledException)
            {
                return;
            }
        }

        _ = ReconnectSynchronized(ReconnectionType.Lost, false, causedException);
    }

    public global::System.Threading.Tasks.Task Reconnect() => ReconnectInternal(false);
    public global::System.Threading.Tasks.Task ReconnectOrFail() => ReconnectInternal(true);

    private async global::System.Threading.Tasks.Task ReconnectInternal(bool failFast)
    {
        if (!IsStarted) return;
        try
        {
            await ReconnectSynchronized(ReconnectionType.ByUser, failFast, null).ConfigureAwait(false);
        }
        finally
        {
            _reconnecting = false;
        }
    }

    private async global::System.Threading.Tasks.Task ReconnectSynchronized(
        ReconnectionType type, bool failFast, Exception? causedException)
    {
        using (await _locker.LockAsync())
        {
            await Reconnect(type, failFast, causedException);
        }
    }

    private async global::System.Threading.Tasks.Task Reconnect(
        ReconnectionType type, bool failFast, Exception? causedException)
    {
        IsRunning = false;
        if (_disposing || !IsStarted) return;

        _reconnecting = true;

        var disType = ToDisconnectionType(type);
        var disInfo = DisconnectionInfo.Create(disType, _client, causedException);
        if (type != ReconnectionType.Error
            && _client?.State != WebSocketState.CloseReceived
            && _client?.State != WebSocketState.Closed)
        {
            await OnDisconnectionHappened(disInfo).ConfigureAwait(false);
            if (disInfo.CancelReconnection)
            {
                _reconnecting = false;
                return;
            }
        }

        _cancellation?.Cancel();
        try { _client?.Abort(); } catch { /* ignored */ }
        _client?.Dispose();

        if (type != ReconnectionType.Error && (!_isReconnectionEnabled || disInfo.CancelReconnection))
        {
            IsStarted = false;
            _reconnecting = false;
            return;
        }

        _cancellation = new CancellationTokenSource();
        await StartClient(Url, _cancellation.Token, failFast).ConfigureAwait(false);
        if (IsRunning)
        {
            await OnReconnectionHappened(ReconnectionInfo.Create(type)).ConfigureAwait(false);
        }
        _reconnecting = false;
    }

    private bool ShouldIgnoreReconnection(WebSocket client)
    {
        var inProgress = _disposing || _reconnecting || _stopping;
        var differentClient = client != _client;
        return inProgress || differentClient;
    }

    private static DisconnectionType ToDisconnectionType(ReconnectionType type) => type switch
    {
        ReconnectionType.Initial => DisconnectionType.Exit,
        ReconnectionType.Lost => DisconnectionType.Lost,
        ReconnectionType.NoMessageReceived => DisconnectionType.NoMessageReceived,
        ReconnectionType.Error => DisconnectionType.Error,
        ReconnectionType.ByUser => DisconnectionType.ByUser,
        ReconnectionType.ByServer => DisconnectionType.ByServer,
        _ => DisconnectionType.Exit
    };

    private void ActivateLastChance()
    {
        var timerMs = 1000;
        _lastChanceTimer = new Timer(LastChance, null, timerMs, timerMs);
    }

    private void DeactivateLastChance()
    {
        _lastChanceTimer?.Dispose();
        _lastChanceTimer = null;
    }

    private void LastChance(object? state)
    {
        if (!_isReconnectionEnabled || ReconnectTimeout == null)
        {
            DeactivateLastChance();
            return;
        }

        var timeoutMs = Math.Abs(ReconnectTimeout.Value.TotalMilliseconds);
        var diffMs = Math.Abs(DateTime.UtcNow.Subtract(_lastReceivedMsg).TotalMilliseconds);
        if (diffMs > timeoutMs)
        {
            DeactivateLastChance();
            _ = ReconnectSynchronized(ReconnectionType.NoMessageReceived, false, null);
        }
    }

    private ClientWebSocket GetSpecificOrThrow(WebSocket client)
    {
        if (client is null)
            return null;
        var specific = client as ClientWebSocket;
        if (specific is null)
            throw new WebsocketException(
                "Cannot cast 'WebSocket' client to 'ClientWebSocket', "
                    + "provide correct type via factory or don't use this property at all."
            );
        return specific;
    }
}
