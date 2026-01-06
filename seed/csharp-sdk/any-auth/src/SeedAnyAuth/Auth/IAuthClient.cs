using SeedAnyAuth.Core;

namespace SeedAnyAuth;

public partial interface IAuthClient
{
    async Task<TokenResponse> GetTokenAsync(
        GetTokenRequest request,
        IRequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
