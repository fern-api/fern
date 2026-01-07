using SeedWebsocket.Empty;

namespace SeedWebsocket;

public partial interface ISeedWebsocketClient
{
    public EmptyClient Empty { get; }
}
