using System.Net.WebSockets;
using System.Text.Json;
using SeedWebsocket.Core.Async;
using SeedWebsocket.Core.Async.Models;

namespace SeedWebsocket.Empty;

public partial class EmptyRealtimeApi : AsyncApi<EmptyRealtimeApi.Options>
{
    /// <summary>
    /// Default constructor
    /// </summary>
    public EmptyRealtimeApi()
        : this(new EmptyRealtimeApi.Options()) { }

    /// <summary>
    /// Constructor with options
    /// </summary>
    public EmptyRealtimeApi(EmptyRealtimeApi.Options options)
        : base(options) { }

    /// <summary>
    /// Creates the Uri for the websocket connection from the BaseUrl and parameters
    /// </summary>
    protected override Uri CreateUri()
    {
        var uri = new UriBuilder(BaseUrl);
        uri.Path = $"{uri.Path.TrimEnd('/')}/empty/realtime";
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
        await ExceptionOccurred
            .RaiseEvent(new Exception($"Unknown message: {json.ToString()}"))
            .ConfigureAwait(false);
    }

    /// <summary>
    /// Disposes of event subscriptions
    /// </summary>
    protected override void DisposeEvents() { }

    /// <summary>
    /// Options for the API client
    /// </summary>
    public class Options : AsyncApiOptions
    {
        /// <summary>
        /// The Websocket URL for the API connection.
        /// </summary>
        override public string BaseUrl { get; set; } = "";
    }
}
