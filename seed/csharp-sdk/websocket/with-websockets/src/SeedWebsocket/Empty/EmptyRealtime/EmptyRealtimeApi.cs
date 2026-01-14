using System.ComponentModel;
using System.Text.Json;
using SeedWebsocket.Core.WebSockets;

namespace SeedWebsocket.Empty;

public partial class EmptyRealtimeApi : IAsyncDisposable, IDisposable, INotifyPropertyChanged
{
    private readonly EmptyRealtimeApi.Options _options;

    private readonly WebSocketClient _client;

    /// <summary>
    /// Event that is raised when a property value changes.
    /// </summary>
    public event PropertyChangedEventHandler PropertyChanged
    {
        add => _client.PropertyChanged += value;
        remove => _client.PropertyChanged -= value;
    }

    /// <summary>
    /// Default constructor
    /// </summary>
    public EmptyRealtimeApi() { }

    /// <summary>
    /// Constructor with options
    /// </summary>
    public EmptyRealtimeApi(EmptyRealtimeApi.Options options)
    {
        _options = options;
        var uri = CreateUri();
        _client = new WebSocketClient(uri, OnTextMessage);
    }

    /// <summary>
    /// Gets the current connection status of the WebSocket.
    /// </summary>
    public ConnectionStatus Status
    {
        get => _client.Status;
    }

    /// <summary>
    /// Event that is raised when the WebSocket connection is established.
    /// </summary>
    public Event<Connected> Connected
    {
        get => _client.Connected;
    }

    /// <summary>
    /// Event that is raised when the WebSocket connection is closed.
    /// </summary>
    public Event<Closed> Closed
    {
        get => _client.Closed;
    }

    /// <summary>
    /// Event that is raised when an exception occurs during WebSocket operations.
    /// </summary>
    public Event<Exception> ExceptionOccurred
    {
        get => _client.ExceptionOccurred;
    }

    /// <summary>
    /// Creates the Uri for the websocket connection from the BaseUrl and parameters
    /// </summary>
    private Uri CreateUri()
    {
        var uri = new UriBuilder(_options.BaseUrl);
        uri.Path = $"{uri.Path.TrimEnd('/')}/empty/realtime";
        return uri.Uri;
    }

    /// <summary>
    /// Dispatches incoming WebSocket messages
    /// </summary>
    private async Task OnTextMessage(Stream stream)
    {
        var json = await JsonSerializer.DeserializeAsync<JsonDocument>(stream);
        if (json == null)
        {
            await ExceptionOccurred
                .RaiseEvent(new Exception("Invalid message - Not valid JSON"))
                .ConfigureAwait(false);
            return;
        }

        // deserialize the message to find the correct event
        await ExceptionOccurred
            .RaiseEvent(new Exception($"Unknown message: {json.ToString()}"))
            .ConfigureAwait(false);
    }

    /// <summary>
    /// Asynchronously establishes a WebSocket connection.
    /// </summary>
    public async Task ConnectAsync()
    {
        await _client.ConnectAsync().ConfigureAwait(false);
    }

    /// <summary>
    /// Asynchronously closes the WebSocket connection.
    /// </summary>
    public async Task CloseAsync()
    {
        await _client.CloseAsync().ConfigureAwait(false);
    }

    /// <summary>
    /// Asynchronously disposes the WebSocket client.
    /// </summary>
    public ValueTask DisposeAsync()
    {
        return new ValueTask(DisposeAsyncCore());

        async Task DisposeAsyncCore()
        {
            await _client.DisposeAsync().ConfigureAwait(false);
        }
    }

    /// <summary>
    /// Disposes the WebSocket client.
    /// </summary>
    public void Dispose()
    {
        _client.Dispose();
    }

    /// <summary>
    /// Options for the API client
    /// </summary>
    public class Options
    {
        /// <summary>
        /// The Websocket URL for the API connection.
        /// </summary>
        public string BaseUrl { get; set; } = "";
    }
}
