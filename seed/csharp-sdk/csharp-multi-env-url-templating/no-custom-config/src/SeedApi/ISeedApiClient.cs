using SeedApi.Auth;
using SeedApi.Core;

namespace SeedApi;

public partial interface ISeedApiClient
{
    public IAuthClient Auth { get; }
    public ICoreClient Core { get; }
}
