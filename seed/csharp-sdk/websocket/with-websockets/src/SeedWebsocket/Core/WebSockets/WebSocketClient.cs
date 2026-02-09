using global::System.ComponentModel;
using global::System.Net.WebSockets;
using global::System.Runtime.CompilerServices;

namespace SeedWebsocket.Core.WebSockets;

/// <summary>
/// A WebSocket client that handles connection management, message sending, and event handling.
/// </summary>
internal sealed class WebSocketClient : IAsyncDisposable, IDisposable, INotifyPropertyChanged
{
    private ConnectionStatus _status = ConnectionStatus.Disconnected;
    private WebSocketConnection? _webSocket;
    private readonly Uri _uri;
    private readonly Func<Stream, global::System.Threading.Tasks.Task> _onTextMessage;

    /// <summary>
    /// Initializes a new instance of the WebSocketClient class.
    /// </summary>
    /// <param name="uri">The WebSocket URI to connect to.</param>
    /// <param name="onTextMessage">Handler for incoming text messages.</param>
    public WebSocketClient(Uri uri, Func<Stream, global::System.Threading.Tasks.Task> onTextMessage)
    {
        _uri = uri;
        _onTextMessage = onTextMessage;
    }

    /// <summary>
    /// Gets the current connection status of the WebSocket.
    /// </summary>
    public ConnectionStatus Status
    {
        get => _status;
        private set
        {
            if (_status != value)
            {
                _status = value;
                OnPropertyChanged();
            }
        }
    }

    /// <summary>
    /// Ensures the WebSocket is connected before sending.
    /// </summary>
    private void EnsureConnected()
    {
        this.Assert(
            Status == ConnectionStatus.Connected,
            $"Cannot send message when status is {Status}"
        );
    }

    /// <summary>
    /// Sends a text message instantly through the WebSocket connection.
    /// </summary>
    /// <param name="message">The text message to send.</param>
    /// <returns>A task representing the asynchronous send operation.</returns>
    /// <exception cref="Exception">Thrown when the connection is not in Connected status.</exception>
    public global::System.Threading.Tasks.Task SendInstant(string message)
    {
        EnsureConnected();
        return _webSocket!.SendInstant(message);
    }

    /// <summary>
    /// Sends a binary message instantly through the WebSocket connection.
    /// </summary>
    /// <param name="message">The binary message to send as a Memory&lt;byte&gt;.</param>
    /// <returns>A task representing the asynchronous send operation.</returns>
    /// <exception cref="Exception">Thrown when the connection is not in Connected status.</exception>
    public global::System.Threading.Tasks.Task SendInstant(Memory<byte> message)
    {
        EnsureConnected();
        return _webSocket!.SendInstant(message);
    }

    /// <summary>
    /// Sends a binary message instantly through the WebSocket connection.
    /// </summary>
    /// <param name="message">The binary message to send as an ArraySegment&lt;byte&gt;.</param>
    /// <returns>A task representing the asynchronous send operation.</returns>
    /// <exception cref="Exception">Thrown when the connection is not in Connected status.</exception>
    public global::System.Threading.Tasks.Task SendInstant(ArraySegment<byte> message)
    {
        EnsureConnected();
        return _webSocket!.SendInstant(message);
    }

    /// <summary>
    /// Sends a binary message instantly through the WebSocket connection.
    /// </summary>
    /// <param name="message">The binary message to send as a byte array.</param>
    /// <returns>A task representing the asynchronous send operation.</returns>
    /// <exception cref="Exception">Thrown when the connection is not in Connected status.</exception>
    public global::System.Threading.Tasks.Task SendInstant(byte[] message)
    {
        EnsureConnected();
        return _webSocket!.SendInstant(message);
    }

    /// <summary>
    /// Asynchronously disposes the WebSocketClient instance, closing any active connections and cleaning up resources.
    /// </summary>
    /// <returns>A ValueTask representing the asynchronous dispose operation.</returns>
    public async ValueTask DisposeAsync()
    {
        if (_webSocket is not null)
        {
            if (_webSocket.IsRunning)
            {
                await CloseAsync().ConfigureAwait(false);
            }

            _webSocket.Dispose();
            _webSocket = null;
        }

        DisposeEventsInternal();
        GC.SuppressFinalize(this);
    }

    /// <summary>
    /// Synchronously disposes the WebSocketClient instance, closing any active connections and cleaning up resources.
    /// </summary>
    public void Dispose()
    {
        if (_webSocket is not null)
        {
            if (_webSocket.IsRunning)
            {
                CloseAsync().Wait();
            }

            _webSocket.Dispose();
        }

        DisposeEventsInternal();
        GC.SuppressFinalize(this);
    }

    /// <summary>
    /// Disposes all internal events.
    /// </summary>
    private void DisposeEventsInternal()
    {
        ExceptionOccurred.Dispose();
        Closed.Dispose();
        Connected.Dispose();
    }

    /// <summary>
    /// Asynchronously closes the WebSocket connection with normal closure status.
    /// </summary>
    /// <returns>A task representing the asynchronous close operation.</returns>
    public async global::System.Threading.Tasks.Task CloseAsync()
    {
        if (_webSocket is not null)
        {
            Status = ConnectionStatus.Disconnecting;
            await _webSocket.StopOrFail(WebSocketCloseStatus.NormalClosure, "");
            Status = ConnectionStatus.Disconnected;
        }
    }

    /// <summary>
    /// Asynchronously establishes a WebSocket connection to the target URI.
    /// </summary>
    /// <returns>A task representing the asynchronous connect operation.</returns>
    /// <exception cref="Exception">Thrown when the connection status is not Disconnected or when connection fails.</exception>
    public async global::System.Threading.Tasks.Task ConnectAsync()
    {
        this.Assert(
            Status == ConnectionStatus.Disconnected,
            $"Connection status is currently {Status}"
        );

        _webSocket?.Dispose();

        Status = ConnectionStatus.Connecting;

        _webSocket = new WebSocketConnection(_uri, () => new ClientWebSocket())
        {
            ExceptionOccurred = ExceptionOccurred.RaiseEvent,
            TextMessageReceived = _onTextMessage,
            BinaryMessageReceived = stream =>
            {
                stream.Dispose();
                return global::System.Threading.Tasks.Task.CompletedTask;
            },
            DisconnectionHappened = async d =>
            {
                await Closed
                    .RaiseEvent(
                        new Closed { Code = (int?)d.CloseStatus, Reason = d.CloseStatusDescription }
                    )
                    .ConfigureAwait(false);
            },
        };

        try
        {
            await _webSocket.StartOrFail().ConfigureAwait(false);
            Status = ConnectionStatus.Connected;
            await Connected.RaiseEvent(new Connected()).ConfigureAwait(false);
        }
        catch (Exception)
        {
            Status = ConnectionStatus.Disconnected;
            throw;
        }
    }

    /// <summary>
    /// Event that is raised when the WebSocket connection is successfully established.
    /// </summary>
    public readonly Event<Connected> Connected = new();

    /// <summary>
    /// Event that is raised when the WebSocket connection is closed.
    /// </summary>
    public readonly Event<Closed> Closed = new();

    /// <summary>
    /// Event that is raised when an exception occurs during WebSocket operations.
    /// </summary>
    public readonly Event<Exception> ExceptionOccurred = new();

    /// <summary>
    /// Event that is raised when a property value changes.
    /// Currently only raised for the Status property.
    /// </summary>
    public event PropertyChangedEventHandler? PropertyChanged;

    /// <summary>
    /// Raises the PropertyChanged event.
    /// </summary>
    /// <param name="propertyName">The name of the property that changed. Automatically populated by the compiler.</param>
    private void OnPropertyChanged([CallerMemberName] string? propertyName = null)
    {
        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
    }
}
