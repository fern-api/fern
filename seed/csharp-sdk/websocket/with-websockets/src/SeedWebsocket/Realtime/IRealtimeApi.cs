using SeedWebsocket.Core.WebSockets;

namespace SeedWebsocket;

public partial interface IRealtimeApi : IAsyncDisposable, IDisposable
{
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
