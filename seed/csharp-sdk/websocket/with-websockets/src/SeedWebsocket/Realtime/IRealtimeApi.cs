using System.Text.Json;
using SeedWebsocket.Core.WebSockets;

namespace SeedWebsocket;

public partial interface IRealtimeApi : IAsyncDisposable, IDisposable
{
    public Event<ReceiveEvent> ReceiveEvent { get; }
    public Event<ReceiveSnakeCase> ReceiveSnakeCase { get; }
    public Event<ReceiveEvent2> ReceiveEvent2 { get; }
    public Event<ReceiveEvent3> ReceiveEvent3 { get; }
    public Event<TranscriptEvent> TranscriptEvent { get; }
    public Event<FlushedEvent> FlushedEvent { get; }
    public Event<ErrorEvent> ErrorEvent { get; }
    public Event<JsonElement> UnknownMessage { get; }
    public Event<Connected> Connected { get; }
    public Event<Closed> Closed { get; }
    public Event<Exception> ExceptionOccurred { get; }
    public ConnectionStatus Status { get; }
    Task ConnectAsync();

    Task Send(SendEvent message);

    Task Send(SendSnakeCase message);

    Task Send(SendEvent2 message);

    Task CloseAsync();
}
