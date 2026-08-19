using global::System.Text.Json;
using SeedWebsocket.Core.WebSockets;

namespace SeedWebsocket.Empty;

public partial interface IEmptyRealtimeApi : IAsyncDisposable, IDisposable
{
    public Event<Connected> Connected { get; }
    public Event<Closed> Closed { get; }
    public Event<Exception> ExceptionOccurred { get; }
    public Event<ReconnectionInfo> Reconnecting { get; }
    public Event<JsonElement> UnknownMessage { get; }
    public ConnectionStatus Status { get; }
    Task ConnectAsync(CancellationToken cancellationToken = default);

    Task CloseAsync(CancellationToken cancellationToken = default);
}
