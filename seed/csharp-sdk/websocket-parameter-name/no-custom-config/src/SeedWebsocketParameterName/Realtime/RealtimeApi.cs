using System.Net.WebSockets;
using System.Text.Json;
using SeedWebsocketParameterName.Core;
using SeedWebsocketParameterName.Core.Async;
using SeedWebsocketParameterName.Core.Async.Events;
using SeedWebsocketParameterName.Core.Async.Models;

namespace SeedWebsocketParameterName;

public partial class RealtimeApi : AsyncApi<RealtimeApi.Options>
{
    /// <summary>
    /// Event handler for ReceivePayload.
    /// Use ReceivePayload.Subscribe(...) to receive messages.
    /// </summary>
    public readonly Event<ReceivePayload> ReceivePayload = new();

    /// <summary>
    /// Constructor with options
    /// </summary>
    public RealtimeApi(RealtimeApi.Options options)
        : base(options) { }

    /// <summary>
    /// The session settings for the connection.
    /// </summary>
    public string? ConnectSessionSettings
    {
        get => ApiOptions.ConnectSessionSettings;
        set =>
            NotifyIfPropertyChanged(
                EqualityComparer<string>.Default.Equals(ApiOptions.ConnectSessionSettings),
                ApiOptions.ConnectSessionSettings = value
            );
    }

    /// <summary>
    /// The API key for authentication.
    /// </summary>
    public string ApiKey
    {
        get => ApiOptions.ApiKey;
        set =>
            NotifyIfPropertyChanged(
                EqualityComparer<string>.Default.Equals(ApiOptions.ApiKey),
                ApiOptions.ApiKey = value
            );
    }

    /// <summary>
    /// The model version to use.
    /// </summary>
    public string? Version
    {
        get => ApiOptions.Version;
        set =>
            NotifyIfPropertyChanged(
                EqualityComparer<string>.Default.Equals(ApiOptions.Version),
                ApiOptions.Version = value
            );
    }

    /// <summary>
    /// Creates the Uri for the websocket connection from the BaseUrl and parameters
    /// </summary>
    protected override Uri CreateUri()
    {
        var uri = new UriBuilder(BaseUrl)
        {
            Query = new Query()
            {
                { "session_settings", ConnectSessionSettings },
                { "api_key", ApiKey },
                { "model_version", Version },
            },
        };
        uri.Path = $"{uri.Path.TrimEnd('/')}/chat";
        return uri.Uri;
    }

    protected override void SetConnectionOptions(ClientWebSocketOptions options) { }

    /// <summary>
    /// Dispatches incoming WebSocket messages
    /// </summary>
    protected async override Task OnTextMessage(Stream stream)
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
            if (JsonUtils.TryDeserialize(json, out ReceivePayload? message))
            {
                await ReceivePayload.RaiseEvent(message!).ConfigureAwait(false);
                return;
            }
        }

        await ExceptionOccurred
            .RaiseEvent(new Exception($"Unknown message: {json.ToString()}"))
            .ConfigureAwait(false);
    }

    /// <summary>
    /// Disposes of event subscriptions
    /// </summary>
    protected override void DisposeEvents()
    {
        ReceivePayload.Dispose();
    }

    /// <summary>
    /// Sends a SendPayload message to the server
    /// </summary>
    public async Task Send(SendPayload message)
    {
        await SendInstant(JsonUtils.Serialize(message)).ConfigureAwait(false);
    }

    /// <summary>
    /// Options for the API client
    /// </summary>
    public class Options : AsyncApiOptions
    {
        /// <summary>
        /// The Websocket URL for the API connection.
        /// </summary>
        override public string BaseUrl { get; set; } = "";

        /// <summary>
        /// The session settings for the connection.
        /// </summary>
        public string? ConnectSessionSettings { get; set; }

        /// <summary>
        /// The API key for authentication.
        /// </summary>
        public required string ApiKey { get; set; }

        /// <summary>
        /// The model version to use.
        /// </summary>
        public string? Version { get; set; }
    }
}
