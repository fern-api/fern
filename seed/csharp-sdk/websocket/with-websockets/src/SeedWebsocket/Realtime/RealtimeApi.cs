using System.IO;
using System.Net.WebSockets;
using System.Text.Json;
using System.Threading.Tasks;
using SeedWebsocket.Core;
using SeedWebsocket.Core.Async;
using SeedWebsocket.Core.Async.Events;
using SeedWebsocket.Core.Async.Models;

namespace SeedWebsocket;

public partial class RealtimeApi : AsyncApi<RealtimeApi.Options>
{
    public readonly Event<ReceiveEvent> ReceiveEvent = new();

    public readonly Event<ReceiveSnakeCase> ReceiveSnakeCase = new();

    public readonly Event<ReceiveEvent2> ReceiveEvent2 = new();

    public readonly Event<ReceiveEvent3> ReceiveEvent3 = new();

    /// <summary>
    /// Default constructor
    /// </summary>
    public RealtimeApi()
        : this(new RealtimeApi.Options()) { }

    /// <summary>
    /// Constructor with options
    /// </summary>
    public RealtimeApi(RealtimeApi.Options options)
        : base(options) { }

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

    protected override Uri CreateUri()
    {
        return new UriBuilder(BaseUrl.TrimEnd('/') + "/realtime/")
        {
            Query = new Query() { { "model", Model }, { "temperature", Temperature } },
        }.Uri;
    }

    protected override void SetConnectionOptions(ClientWebSocketOptions options) { }

    protected override async Task OnTextMessage(Stream stream)
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

        try
        {
            var message = json.Deserialize<ReceiveEvent>();
            if (message != null)
            {
                await ReceiveEvent.RaiseEvent(message).ConfigureAwait(false);
                return;
            }
        }
        catch (Exception)
        {
            // message is not ReceiveEvent, continue
        }

        try
        {
            var message = json.Deserialize<ReceiveSnakeCase>();
            if (message != null)
            {
                await ReceiveSnakeCase.RaiseEvent(message).ConfigureAwait(false);
                return;
            }
        }
        catch (Exception)
        {
            // message is not ReceiveSnakeCase, continue
        }

        try
        {
            var message = json.Deserialize<ReceiveEvent2>();
            if (message != null)
            {
                await ReceiveEvent2.RaiseEvent(message).ConfigureAwait(false);
                return;
            }
        }
        catch (Exception)
        {
            // message is not ReceiveEvent2, continue
        }

        try
        {
            var message = json.Deserialize<ReceiveEvent3>();
            if (message != null)
            {
                await ReceiveEvent3.RaiseEvent(message).ConfigureAwait(false);
                return;
            }
        }
        catch (Exception)
        {
            // message is not ReceiveEvent3, continue
        }

        await ExceptionOccurred
            .RaiseEvent(new Exception($"Unknown message: {json.ToString()}"))
            .ConfigureAwait(false);
    }

    protected override void DisposeEvents()
    {
        ReceiveEvent.Dispose();
        ReceiveSnakeCase.Dispose();
        ReceiveEvent2.Dispose();
        ReceiveEvent3.Dispose();
    }

    public async Task Send(SendEvent message)
    {
        await SendInstant(JsonUtils.Serialize(message)).ConfigureAwait(false);
    }

    public async Task Send(SendSnakeCase message)
    {
        await SendInstant(JsonUtils.Serialize(message)).ConfigureAwait(false);
    }

    public async Task Send(SendEvent2 message)
    {
        await SendInstant(JsonUtils.Serialize(message)).ConfigureAwait(false);
    }

    public class Options : AsyncApiOptions
    {
        /// <summary>
        /// The Websocket URL for the API connection.
        /// </summary>
        override public string BaseUrl { get; set; } = "";

        public string? Model { get; set; }

        public int? Temperature { get; set; }
    }
}
