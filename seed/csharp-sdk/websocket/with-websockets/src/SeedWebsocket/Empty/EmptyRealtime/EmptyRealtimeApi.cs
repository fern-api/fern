using System.ComponentModel;
using System.Text.Json;
using System.Text.Json.Serialization;
using SeedWebsocket.Core;
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
        var uri = new UriBuilder(_options.BaseUrl);
        uri.Path = $"{uri.Path.TrimEnd('/')}/empty/realtime";
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
    private void DisposeEvents() { }

    /// <summary>
    /// Dispatches incoming WebSocket messages
    /// </summary>
    private async Task OnTextMessage(Stream stream)
    {
        var message = await JsonSerializer.DeserializeAsync<IncomingMessage>(
            stream,
            JsonOptions.JsonSerializerOptions
        );
        if (message == null)
        {
            await ExceptionOccurred
                .RaiseEvent(new Exception("Invalid message - Not valid JSON"))
                .ConfigureAwait(false);
            return;
        }

        await ExceptionOccurred
            .RaiseEvent(new Exception($"Unknown message type: {message.Type}"))
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

    [JsonConverter(typeof(EmptyRealtimeApi.IncomingMessage.JsonConverter))]
    internal class IncomingMessage
    {
        private IncomingMessage(string type, object? value)
        {
            Type = type;
            Value = value;
        }

        /// <summary>
        /// Type discriminator
        /// </summary>
        internal string Type { get; }

        /// <summary>
        /// Union value
        /// </summary>
        internal object? Value { get; }

        internal sealed class JsonConverter : JsonConverter<EmptyRealtimeApi.IncomingMessage>
        {
            public override EmptyRealtimeApi.IncomingMessage? Read(
                ref Utf8JsonReader reader,
                System.Type typeToConvert,
                JsonSerializerOptions options
            )
            {
                var document = JsonDocument.ParseValue(ref reader);

                var types = new (string Key, System.Type Type)[] { };

                foreach (var (key, type) in types)
                {
                    try
                    {
                        var value = document.Deserialize(type, options);
                        if (value != null)
                        {
                            return new IncomingMessage(key, value);
                        }
                    }
                    catch (JsonException) { }
                }

                return null;
            }

            public override void Write(
                Utf8JsonWriter writer,
                EmptyRealtimeApi.IncomingMessage value,
                JsonSerializerOptions options
            )
            {
                if (value.Value != null)
                {
                    JsonSerializer.Serialize(writer, value.Value, value.Value.GetType(), options);
                }
            }
        }
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
