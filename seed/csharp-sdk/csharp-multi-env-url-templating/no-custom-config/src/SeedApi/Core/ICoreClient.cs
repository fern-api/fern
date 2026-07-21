using SeedApi;

namespace SeedApi.Core;

public partial interface ICoreClient
{
    WithRawResponseTask<ListThingsResponse> ListThingsAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
