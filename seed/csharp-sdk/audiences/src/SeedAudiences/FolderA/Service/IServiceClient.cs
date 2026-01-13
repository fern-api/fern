using SeedAudiences;

namespace SeedAudiences.FolderA;

public partial interface IServiceClient
{
    Task<Response> GetDirectThreadAsync(
        GetDirectThreadRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
