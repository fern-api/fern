using System.ComponentModel;
using System.Text.Json;
using SeedWebsocket.Core;
using SeedWebsocket.Core.WebSockets;

namespace SeedWebsocket;

public partial class RealtimeApi : IAsyncDisposable, IDisposable, INotifyPropertyChanged
{
    private readonly RealtimeApi.Options _options;

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
    /// Event handler for ReceiveEvent.
    /// Use ReceiveEvent.Subscribe(...) to receive messages.
    /// </summary>
    public readonly Event<ReceiveEvent> ReceiveEvent = new();

    /// <summary>
    /// Event handler for ReceiveSnakeCase.
    /// Use ReceiveSnakeCase.Subscribe(...) to receive messages.
    /// </summary>
    public readonly Event<ReceiveSnakeCase> ReceiveSnakeCase = new();

    /// <summary>
    /// Event handler for ReceiveEvent2.
    /// Use ReceiveEvent2.Subscribe(...) to receive messages.
    /// </summary>
    public readonly Event<ReceiveEvent2> ReceiveEvent2 = new();

    /// <summary>
    /// Event handler for ReceiveEvent3.
    /// Use ReceiveEvent3.Subscribe(...) to receive messages.
    /// </summary>
    public readonly Event<ReceiveEvent3> ReceiveEvent3 = new();

    /// <summary>
    /// Constructor with options
    /// </summary>
    public RealtimeApi(RealtimeApi.Options options)
    {
        _options = options;
        var uri = new UriBuilder(_options.BaseUrl)
        {
            Query = new SeedWebsocket.Core.QueryStringBuilder.Builder(capacity: 3)
                .Add("model", _options.Model)
                .Add("temperature", _options.Temperature)
                .Add("language-code", _options.LanguageCode)
                .Build(),
        };
        uri.Path = $"{uri.Path.TrimEnd('/')}/realtime/{Uri.EscapeDataString(_options.SessionId)}";
        _client = new WebSocketClient(uri.Uri, OnTextMessage);
    }

    /// <summary>
    /// Gets the current connection status of the WebSocket.
    /// </summary>
    public ConnectionStatus Status => _client.Status;

    /// <summary>
    /// Event that is raised when the WebSocket connection is established.
    /// </summary>
    public Event<Connected> Connected => _client.Connected;

    /// <summary>
    /// Event that is raised when the WebSocket connection is closed.
    /// </summary>
    public Event<Closed> Closed => _client.Closed;

    /// <summary>
    /// Event that is raised when an exception occurs during WebSocket operations.
    /// </summary>
    public Event<Exception> ExceptionOccurred => _client.ExceptionOccurred;

    /// <summary>
    /// Disposes of event subscriptions
    /// </summary>
    private void DisposeEvents()
    {
        ReceiveEvent.Dispose();
        ReceiveSnakeCase.Dispose();
        ReceiveEvent2.Dispose();
        ReceiveEvent3.Dispose();
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
        {
            if (JsonUtils.TryDeserialize(json, out ReceiveEvent? message))
            {
                await ReceiveEvent.RaiseEvent(message!).ConfigureAwait(false);
                return;
            }
        }

        {
            if (JsonUtils.TryDeserialize(json, out ReceiveSnakeCase? message))
            {
                await ReceiveSnakeCase.RaiseEvent(message!).ConfigureAwait(false);
                return;
            }
        }

        {
            if (JsonUtils.TryDeserialize(json, out ReceiveEvent2? message))
            {
                await ReceiveEvent2.RaiseEvent(message!).ConfigureAwait(false);
                return;
            }
        }

        {
            if (JsonUtils.TryDeserialize(json, out ReceiveEvent3? message))
            {
                await ReceiveEvent3.RaiseEvent(message!).ConfigureAwait(false);
                return;
            }
        }

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
    /// Asynchronously disposes the WebSocket client, closing any active connections and cleaning up resources.
    /// </summary>
    public async ValueTask DisposeAsync()
    {
        await _client.DisposeAsync();
        DisposeEvents();
        GC.SuppressFinalize(this);
    }

    /// <summary>
    /// Synchronously disposes the WebSocket client, closing any active connections and cleaning up resources.
    /// </summary>
    public void Dispose()
    {
        _client.Dispose();
        DisposeEvents();
        GC.SuppressFinalize(this);
    }

    /// <summary>
    /// Sends a SendEvent message to the server
    /// </summary>
    public async Task Send(SendEvent message)
    {
        await _client.SendInstant(JsonUtils.Serialize(message)).ConfigureAwait(false);
    }

    /// <summary>
    /// Sends a SendSnakeCase message to the server
    /// </summary>
    public async Task Send(SendSnakeCase message)
    {
        await _client.SendInstant(JsonUtils.Serialize(message)).ConfigureAwait(false);
    }

    /// <summary>
    /// Sends a SendEvent2 message to the server
    /// </summary>
    public async Task Send(SendEvent2 message)
    {
        await _client.SendInstant(JsonUtils.Serialize(message)).ConfigureAwait(false);
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

        public string? Model { get; set; }

        public int? Temperature { get; set; }

        public string? LanguageCode { get; set; }

        public required string SessionId { get; set; }
    }
}
