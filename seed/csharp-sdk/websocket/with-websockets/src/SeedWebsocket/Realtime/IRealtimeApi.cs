using SeedWebsocket.Core.WebSockets;

namespace SeedWebsocket;

public partial interface IRealtimeApi : IAsyncDisposable, IDisposable
{
    public Event<Connected> Connected { get; }
    public Event<Closed> Closed { get; }
    public Event<Exception> ExceptionOccurred { get; }
    public ConnectionStatus Status { get; }
    Task ConnectAsync(CancellationToken cancellationToken = default);

    Task Send(SendEvent message, CancellationToken cancellationToken = default);

    Task Send(SendSnakeCase message, CancellationToken cancellationToken = default);

    Task Send(SendEvent2 message, CancellationToken cancellationToken = default);

    Task CloseAsync(CancellationToken cancellationToken = default);
}
