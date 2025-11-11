using System.Net.WebSockets;
using System.Text.Json;
using SeedWebsocket.Core;
using SeedWebsocket.Core.Async;
using SeedWebsocket.Core.Async.Events;
using SeedWebsocket.Core.Async.Models;

namespace SeedWebsocket;

public partial class RealtimeApi : AsyncApi<RealtimeApi.Options>
{
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
        : base(options) { }

    public string SessionId
    {
        get => ApiOptions.SessionId;
        set =>
            NotifyIfPropertyChanged(
                EqualityComparer<string>.Default.Equals(ApiOptions.SessionId),
                ApiOptions.SessionId = value
            );
    }

    public string? Model
    {
        get => ApiOptions.Model;
        set =>
            NotifyIfPropertyChanged(
                EqualityComparer<string>.Default.Equals(ApiOptions.Model),
                ApiOptions.Model = value
            );
    }

    public int? Temperature
    {
        get => ApiOptions.Temperature;
        set =>
            NotifyIfPropertyChanged(
                EqualityComparer<string>.Default.Equals(ApiOptions.Temperature),
                ApiOptions.Temperature = value
            );
    }

    /// <summary>
    /// Creates the Uri for the websocket connection from the BaseUrl and parameters
    /// </summary>
    protected override Uri CreateUri()
    {
        var uri = new UriBuilder(BaseUrl)
        {
            Query = new Query() { { "model", Model }, { "temperature", Temperature } },
        };
        uri.Path = $"{uri.Path.TrimEnd('/')}/realtime/{Uri.EscapeDataString(SessionId)}";
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
    /// Disposes of event subscriptions
    /// </summary>
    protected override void DisposeEvents()
    {
        ReceiveEvent.Dispose();
        ReceiveSnakeCase.Dispose();
        ReceiveEvent2.Dispose();
        ReceiveEvent3.Dispose();
    }

    /// <summary>
    /// Sends a SendEvent message to the server
    /// </summary>
    public async Task Send(SendEvent message)
    {
        await SendInstant(JsonUtils.Serialize(message)).ConfigureAwait(false);
    }

    /// <summary>
    /// Sends a SendSnakeCase message to the server
    /// </summary>
    public async Task Send(SendSnakeCase message)
    {
        await SendInstant(JsonUtils.Serialize(message)).ConfigureAwait(false);
    }

    /// <summary>
    /// Sends a SendEvent2 message to the server
    /// </summary>
    public async Task Send(SendEvent2 message)
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

        public string? Model { get; set; }

        public int? Temperature { get; set; }

        public required string SessionId { get; set; }
    }
}
