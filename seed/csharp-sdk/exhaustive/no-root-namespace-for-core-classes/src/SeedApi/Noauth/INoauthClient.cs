using SeedApi.Core;

namespace SeedApi;

public partial interface INoauthClient
{
    /// <summary>
    /// POST request with no auth
    /// </summary>
    WithRawResponseTask<bool> PostwithnoauthAsync(
        object request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
