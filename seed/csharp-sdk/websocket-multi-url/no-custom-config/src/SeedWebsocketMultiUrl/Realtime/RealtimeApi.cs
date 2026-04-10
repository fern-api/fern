using global::System.ComponentModel;
using global::System.Text;
using global::System.Text.Json;
using SeedWebsocketMultiUrl.Core;
using SeedWebsocketMultiUrl.Core.WebSockets;

namespace SeedWebsocketMultiUrl;

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
    /// Constructor with options
    /// </summary>
    public RealtimeApi(RealtimeApi.Options options)
    {
        _options = options;
        var uri = new UriBuilder(_options.BaseUrl)
        {
            Query = new SeedWebsocketMultiUrl.Core.QueryStringBuilder.Builder(capacity: 1)
                .Add("model", _options.Model)
                .Build(),
        };
        uri.Path = $"{uri.Path.TrimEnd('/')}/realtime/{Uri.EscapeDataString(_options.SessionId)}";
        _client = new WebSocketClient(uri.Uri, OnTextMessage);
        _client.HttpInvoker = _options.HttpInvoker;
        _client.IsReconnectionEnabled = _options.IsReconnectionEnabled;
        _client.ReconnectTimeout = _options.ReconnectTimeout;
        _client.ErrorReconnectTimeout = _options.ErrorReconnectTimeout;
        _client.LostReconnectTimeout = _options.LostReconnectTimeout;
        _client.Backoff = _options.ReconnectBackoff;
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
    /// Event raised when the WebSocket connection is re-established after a disconnect.
    /// </summary>
    public Event<ReconnectionInfo> Reconnecting => _client.Reconnecting;

    /// <summary>
    /// Event handler for ReceiveEvent.
    /// Use ReceiveEvent.Subscribe(...) to receive messages.
    /// </summary>
    public Event<ReceiveEvent> ReceiveEvent { get; } = new();

    /// <summary>
    /// Event handler for unknown/unrecognized message types.
    /// Use UnknownMessage.Subscribe(...) to handle messages from newer server versions.
    /// </summary>
    public Event<JsonElement> UnknownMessage { get; } = new();

    /// <summary>
    /// Disposes of event subscriptions
    /// </summary>
    private void DisposeEvents()
    {
        ReceiveEvent.Dispose();
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
    /// Injects a fake text message for testing. Dispatches through the normal message handling pipeline.
    /// </summary>
    internal async Task InjectTestMessage(string rawJson)
    {
        using var stream = new MemoryStream(Encoding.UTF8.GetBytes(rawJson));
        await OnTextMessage(stream).ConfigureAwait(false);
    }

    /// <summary>
    /// Asynchronously establishes a WebSocket connection.
    /// </summary>
    public async Task ConnectAsync(CancellationToken cancellationToken = default)
    {
#if NET6_0_OR_GREATER
        _client.DeflateOptions = _options.EnableCompression
            ? new System.Net.WebSockets.WebSocketDeflateOptions()
            : null;
#endif
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
    /// Options for the API client
    /// </summary>
    public class Options
    {
        private string _baseUrl = "Production";

        /// <summary>
        /// The Websocket URL for the API connection.
        /// </summary>
        public string BaseUrl
        {
            get => RealtimeApi.Environments.getBaseUrl(_baseUrl);
            set => _baseUrl = value;
        }

        /// <summary>
        /// The Environment for the API connection.
        /// </summary>
        public string Environment
        {
            get => _baseUrl;
            set => _baseUrl = value;
        }

        /// <summary>
        /// Enable per-message deflate compression (RFC 7692). When true, the client sets <c>ClientWebSocketOptions.DangerousDeflateOptions</c> before connecting. Compression is negotiated during the handshake; if the server does not support it, the connection proceeds uncompressed. Default: <c>false</c>.
        /// <para><b>Security warning:</b> do not enable compression when transmitting data containing secrets — compressed encrypted payloads are vulnerable to CRIME/BREACH side-channel attacks. See <see href="https://learn.microsoft.com/dotnet/api/system.net.websockets.clientwebsocketoptions.dangerousdeflateoptions">ClientWebSocketOptions.DangerousDeflateOptions</see> for details.</para>
        /// </summary>
        public bool EnableCompression { get; set; } = false;

        /// <summary>
        /// Optional HTTP/2 handler for multiplexed WebSocket connections (.NET 7+).
        /// </summary>
        public System.Net.Http.HttpMessageInvoker? HttpInvoker { get; set; }

        public string? Model { get; set; }

        public required string SessionId { get; set; }

        /// <summary>
        /// Enable or disable automatic reconnection. Default: false.
        /// </summary>
        public bool IsReconnectionEnabled { get; set; } = false;

        /// <summary>
        /// Time to wait before reconnecting if no message comes from the server. Set null to disable. Default: 1 minute.
        /// </summary>
        public TimeSpan? ReconnectTimeout { get; set; } = TimeSpan.FromMinutes(1);

        /// <summary>
        /// Time to wait before reconnecting if the last reconnection attempt failed. Set null to disable. Default: 1 minute.
        /// </summary>
        public TimeSpan? ErrorReconnectTimeout { get; set; } = TimeSpan.FromMinutes(1);

        /// <summary>
        /// Time to wait before reconnecting if the connection is lost with a transient error. Set null to disable (reconnect immediately). Default: null.
        /// </summary>
        public TimeSpan? LostReconnectTimeout { get; set; }

        /// <summary>
        /// Backoff strategy for reconnection delays. Controls interval growth, jitter, and max attempts. Set to null to use fixed-interval reconnection (legacy behavior). Default: exponential backoff, 1s→60s, unlimited attempts, with jitter.
        /// </summary>
        public ReconnectStrategy? ReconnectBackoff { get; set; } = new ReconnectStrategy();
    }

    /// <summary>
    /// Selectable endpoint URLs for the API client
    /// </summary>
    public static class Environments
    {
        public static string Production { get; set; } = "wss://ws.production.com";

        public static string Staging { get; set; } = "wss://ws.staging.com";

        internal static string getBaseUrl(string environment)
        {
            switch (environment)
            {
                case "Production":
                    return Production;
                case "Staging":
                    return Staging;
                default:
                    return string.IsNullOrEmpty(environment) ? "Production" : environment;
            }
        }
    }
}
