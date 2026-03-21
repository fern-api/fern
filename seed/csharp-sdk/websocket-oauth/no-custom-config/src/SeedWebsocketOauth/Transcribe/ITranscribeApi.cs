using SeedWebsocketOauth.Core.WebSockets;

namespace SeedWebsocketOauth;

public partial interface ITranscribeApi : IAsyncDisposable, IDisposable
{
    public Event<Connected> Connected { get; }
    public Event<Closed> Closed { get; }
    public Event<Exception> ExceptionOccurred { get; }
    public Event<ReconnectionInfo> Reconnecting { get; }
    public ConnectionStatus Status { get; }
    Task ConnectAsync(CancellationToken cancellationToken = default);

    Task Send(AudioEvent message, CancellationToken cancellationToken = default);

    Task CloseAsync(CancellationToken cancellationToken = default);
}
