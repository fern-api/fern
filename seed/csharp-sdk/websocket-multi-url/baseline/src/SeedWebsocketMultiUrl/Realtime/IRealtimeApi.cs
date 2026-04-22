using global::System.Text.Json;
using SeedWebsocketMultiUrl.Core.WebSockets;

namespace SeedWebsocketMultiUrl;

public partial interface IRealtimeApi : IAsyncDisposable, IDisposable
{
    public Event<Connected> Connected { get; }
    public Event<Closed> Closed { get; }
    public Event<Exception> ExceptionOccurred { get; }
    public Event<ReconnectionInfo> Reconnecting { get; }
    public Event<ReceiveEvent> ReceiveEvent { get; }
    public Event<JsonElement> UnknownMessage { get; }
    public ConnectionStatus Status { get; }
    Task ConnectAsync(CancellationToken cancellationToken = default);

    Task Send(SendEvent message, CancellationToken cancellationToken = default);

    Task CloseAsync(CancellationToken cancellationToken = default);
}
