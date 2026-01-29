using SeedExhaustive.Core;

namespace SeedExhaustive;

public partial interface INoAuthClient
{
    /// <summary>
    /// POST request with no auth
    /// </summary>
    WithRawResponseTask<bool> PostWithNoAuthAsync(
        object request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
