using global::System.Text.Json;
using SeedWebsocket.Core.WebSockets;

namespace SeedWebsocket;

public partial interface IRealtimeApi : IAsyncDisposable, IDisposable
{
    public Event<Connected> Connected { get; }
    public Event<Closed> Closed { get; }
    public Event<Exception> ExceptionOccurred { get; }
    public Event<ReconnectionInfo> Reconnecting { get; }
    public Event<ReceiveEvent> ReceiveEvent { get; }
    public Event<ReceiveSnakeCase> ReceiveSnakeCase { get; }
    public Event<ReceiveEvent2> ReceiveEvent2 { get; }
    public Event<ReceiveEvent3> ReceiveEvent3 { get; }
    public Event<TranscriptEvent> TranscriptEvent { get; }
    public Event<FlushedEvent> FlushedEvent { get; }
    public Event<ErrorEvent> ErrorEvent { get; }
    public Event<JsonElement> UnknownMessage { get; }
    public ConnectionStatus Status { get; }
    Task ConnectAsync(CancellationToken cancellationToken = default);

    Task Send(SendEvent message, CancellationToken cancellationToken = default);

    Task Send(SendSnakeCase message, CancellationToken cancellationToken = default);

    Task Send(SendEvent2 message, CancellationToken cancellationToken = default);

    Task CloseAsync(CancellationToken cancellationToken = default);
}
