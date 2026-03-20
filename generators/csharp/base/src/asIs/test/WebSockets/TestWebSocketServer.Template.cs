using System.Net;
using System.Net.WebSockets;
using System.Text;

namespace <%= testNamespace%>.Core.WebSockets;

/// <summary>
/// A lightweight in-process WebSocket server for integration tests.
/// Uses HttpListener with WebSocket support (.NET 8+).
/// </summary>
internal sealed class TestWebSocketServer : IAsyncDisposable
{
    private readonly HttpListener _listener;
    private readonly CancellationTokenSource _cts = new();
    private Task? _acceptLoop;
    private readonly List<WebSocket> _connectedClients = new();
    private readonly object _clientsLock = new();

    /// <summary>
    /// Handler called for each incoming text message. Return a string to echo back, or null for no response.
    /// </summary>
    public Func<string, string?>? OnTextMessage { get; set; }

    /// <summary>
    /// Handler called for each incoming binary message. Return bytes to echo back, or null for no response.
    /// </summary>
    public Func<byte[], byte[]?>? OnBinaryMessage { get; set; }

    /// <summary>
    /// Called when a new client connects.
    /// </summary>
    public Action? OnClientConnected { get; set; }

    /// <summary>
    /// Called when a client disconnects.
    /// </summary>
    public Action? OnClientDisconnected { get; set; }

    private TaskCompletionSource<bool>? _clientConnectedTcs;

    public int Port { get; }
    public Uri Uri => new($"ws://localhost:{Port}/");

    public int ConnectedClientCount
    {
        get
        {
            lock (_clientsLock)
                return _connectedClients.Count(c => c.State == WebSocketState.Open);
        }
    }

    public TestWebSocketServer(int port = 0)
    {
        Port = port == 0 ? GetAvailablePort() : port;
        _listener = new HttpListener();
        _listener.Prefixes.Add($"http://localhost:{Port}/");
    }

    private static int GetAvailablePort()
    {
        var listener = new System.Net.Sockets.TcpListener(IPAddress.Loopback, 0);
        listener.Start();
        var port = ((IPEndPoint)listener.LocalEndpoint).Port;
        listener.Stop();
        return port;
    }

    public void Start()
    {
        _listener.Start();
        _acceptLoop = Task.Run(AcceptLoop);
    }

    private async Task AcceptLoop()
    {
        try
        {
            while (!_cts.Token.IsCancellationRequested)
            {
                var context = await _listener.GetContextAsync();
                if (context.Request.IsWebSocketRequest)
                {
                    var wsContext = await context.AcceptWebSocketAsync(null);
                    _ = HandleClient(wsContext.WebSocket);
                }
                else
                {
                    context.Response.StatusCode = 400;
                    context.Response.Close();
                }
            }
        }
        catch (HttpListenerException) when (_cts.Token.IsCancellationRequested)
        {
            // Expected during shutdown
        }
        catch (ObjectDisposedException)
        {
            // Expected during shutdown
        }
    }

    private async Task HandleClient(WebSocket ws)
    {
        lock (_clientsLock)
            _connectedClients.Add(ws);
        _clientConnectedTcs?.TrySetResult(true);
        OnClientConnected?.Invoke();

        try
        {
            var buffer = new byte[4096];
            while (ws.State == WebSocketState.Open && !_cts.Token.IsCancellationRequested)
            {
                using var ms = new MemoryStream();
                WebSocketReceiveResult result;
                do
                {
                    result = await ws.ReceiveAsync(
                        new ArraySegment<byte>(buffer),
                        _cts.Token
                    );
                    ms.Write(buffer, 0, result.Count);
                } while (!result.EndOfMessage);

                if (result.MessageType == WebSocketMessageType.Close)
                {
                    if (ws.State == WebSocketState.CloseReceived)
                    {
                        await ws.CloseOutputAsync(
                            WebSocketCloseStatus.NormalClosure,
                            "",
                            CancellationToken.None
                        );
                    }
                    break;
                }

                if (result.MessageType == WebSocketMessageType.Text)
                {
                    var text = Encoding.UTF8.GetString(ms.ToArray());
                    var response = OnTextMessage?.Invoke(text);
                    if (response != null)
                    {
                        var responseBytes = Encoding.UTF8.GetBytes(response);
                        await ws.SendAsync(
                            new ArraySegment<byte>(responseBytes),
                            WebSocketMessageType.Text,
                            true,
                            _cts.Token
                        );
                    }
                }
                else if (result.MessageType == WebSocketMessageType.Binary)
                {
                    var data = ms.ToArray();
                    var response = OnBinaryMessage?.Invoke(data);
                    if (response != null)
                    {
                        await ws.SendAsync(
                            new ArraySegment<byte>(response),
                            WebSocketMessageType.Binary,
                            true,
                            _cts.Token
                        );
                    }
                }
            }
        }
        catch (WebSocketException)
        {
            // Client disconnected abruptly
        }
        catch (OperationCanceledException)
        {
            // Server shutting down
        }
        finally
        {
            OnClientDisconnected?.Invoke();
        }
    }

    /// <summary>
    /// Send a text message to all connected clients.
    /// </summary>
    public async Task BroadcastTextAsync(string message)
    {
        var bytes = Encoding.UTF8.GetBytes(message);
        List<WebSocket> clients;
        lock (_clientsLock)
            clients = _connectedClients.Where(c => c.State == WebSocketState.Open).ToList();

        foreach (var client in clients)
        {
            try
            {
                await client.SendAsync(
                    new ArraySegment<byte>(bytes),
                    WebSocketMessageType.Text,
                    true,
                    _cts.Token
                );
            }
            catch
            {
                // Client may have disconnected
            }
        }
    }

    /// <summary>
    /// Send a binary message to all connected clients.
    /// </summary>
    public async Task BroadcastBinaryAsync(byte[] data)
    {
        List<WebSocket> clients;
        lock (_clientsLock)
            clients = _connectedClients.Where(c => c.State == WebSocketState.Open).ToList();

        foreach (var client in clients)
        {
            try
            {
                await client.SendAsync(
                    new ArraySegment<byte>(data),
                    WebSocketMessageType.Binary,
                    true,
                    _cts.Token
                );
            }
            catch
            {
                // Client may have disconnected
            }
        }
    }

    /// <summary>
    /// Forcibly close all connected clients (simulates server crash).
    /// </summary>
    public void AbortAllClients()
    {
        lock (_clientsLock)
        {
            foreach (var client in _connectedClients)
            {
                try
                {
                    client.Abort();
                }
                catch
                {
                    // ignore
                }
            }
        }
    }

    /// <summary>
    /// Gracefully close all connected clients with a proper WebSocket close handshake.
    /// </summary>
    public async Task CloseAllClientsAsync(
        WebSocketCloseStatus status = WebSocketCloseStatus.NormalClosure,
        string description = "Server closing"
    )
    {
        List<WebSocket> clients;
        lock (_clientsLock)
            clients = _connectedClients.Where(c => c.State == WebSocketState.Open).ToList();

        foreach (var client in clients)
        {
            try
            {
                await client.CloseAsync(status, description, CancellationToken.None);
            }
            catch
            {
                // Client may already be closed
            }
        }
    }

    /// <summary>
    /// Returns a task that completes when the next client connects.
    /// Call this BEFORE the client connects to avoid race conditions.
    /// </summary>
    public Task WaitForClientAsync()
    {
        _clientConnectedTcs = new TaskCompletionSource<bool>(TaskCreationOptions.RunContinuationsAsynchronously);
        return _clientConnectedTcs.Task;
    }

    public async ValueTask DisposeAsync()
    {
        _cts.Cancel();
        _listener.Stop();
        if (_acceptLoop != null)
        {
            try
            {
                await _acceptLoop;
            }
            catch
            {
                // ignored
            }
        }

        lock (_clientsLock)
        {
            foreach (var client in _connectedClients)
            {
                try
                {
                    client.Dispose();
                }
                catch
                {
                    // ignored
                }
            }
        }

        _cts.Dispose();
    }
}
