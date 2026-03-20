using System.ComponentModel;
using System.Text.Json;
using SeedWebsocket.Core;
using SeedWebsocket.Core.WebSockets;

namespace SeedWebsocket;

public partial class RealtimeApi
    : IRealtimeApi,
        IAsyncDisposable,
        IDisposable,
        INotifyPropertyChanged
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
    /// Event handler for TranscriptEvent.
    /// Use TranscriptEvent.Subscribe(...) to receive messages.
    /// </summary>
    public readonly Event<TranscriptEvent> TranscriptEvent = new();

    /// <summary>
    /// Event handler for FlushedEvent.
    /// Use FlushedEvent.Subscribe(...) to receive messages.
    /// </summary>
    public readonly Event<FlushedEvent> FlushedEvent = new();

    /// <summary>
    /// Event handler for ErrorEvent.
    /// Use ErrorEvent.Subscribe(...) to receive messages.
    /// </summary>
    public readonly Event<ErrorEvent> ErrorEvent = new();

    /// <summary>
    /// Event handler for unknown/unrecognized message types.
    /// Use UnknownMessage.Subscribe(...) to handle messages from newer server versions.
    /// </summary>
    public readonly Event<JsonElement> UnknownMessage = new();

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
        TranscriptEvent.Dispose();
        FlushedEvent.Dispose();
        ErrorEvent.Dispose();
        UnknownMessage.Dispose();
    }

    /// <summary>
    /// Dispatches incoming WebSocket messages
    /// </summary>
    private async Task OnTextMessage(Stream stream)
    {
        using var json = await JsonSerializer.DeserializeAsync<JsonDocument>(stream);
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

        {
            if (JsonUtils.TryDeserialize(json, out TranscriptEvent? message))
            {
                await TranscriptEvent.RaiseEvent(message!).ConfigureAwait(false);
                return;
            }
        }

        {
            if (JsonUtils.TryDeserialize(json, out FlushedEvent? message))
            {
                await FlushedEvent.RaiseEvent(message!).ConfigureAwait(false);
                return;
            }
        }

        {
            if (JsonUtils.TryDeserialize(json, out ErrorEvent? message))
            {
                await ErrorEvent.RaiseEvent(message!).ConfigureAwait(false);
                return;
            }
        }

        await UnknownMessage.RaiseEvent(json.RootElement.Clone()).ConfigureAwait(false);
    }

    /// <summary>
    /// Serializes and sends a JSON message to the server
    /// </summary>
    private async Task SendJsonAsync(object message, CancellationToken cancellationToken = default)
    {
        await _client
            .SendInstant(JsonUtils.Serialize(message), cancellationToken)
            .ConfigureAwait(false);
    }

    /// <summary>
    /// Asynchronously establishes a WebSocket connection.
    /// </summary>
    public async Task ConnectAsync(CancellationToken cancellationToken = default)
    {
        await _client.ConnectAsync(cancellationToken).ConfigureAwait(false);
    }

    /// <summary>
    /// Asynchronously closes the WebSocket connection.
    /// </summary>
    public async Task CloseAsync(CancellationToken cancellationToken = default)
    {
        await _client.CloseAsync(cancellationToken).ConfigureAwait(false);
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
    public async Task Send(SendEvent message, CancellationToken cancellationToken = default)
    {
        await SendJsonAsync(message, cancellationToken).ConfigureAwait(false);
    }

    /// <summary>
    /// Sends a SendSnakeCase message to the server
    /// </summary>
    public async Task Send(SendSnakeCase message, CancellationToken cancellationToken = default)
    {
        await SendJsonAsync(message, cancellationToken).ConfigureAwait(false);
    }

    /// <summary>
    /// Sends a SendEvent2 message to the server
    /// </summary>
    public async Task Send(SendEvent2 message, CancellationToken cancellationToken = default)
    {
        await SendJsonAsync(message, cancellationToken).ConfigureAwait(false);
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
