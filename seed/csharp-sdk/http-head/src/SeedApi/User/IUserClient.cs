using global::System.Net.Http.Headers;

namespace SeedApi;

public partial interface IUserClient
{
    WithRawResponseTask<IEnumerable<User>> ListAsync(
        UserListRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<HttpResponseHeaders> HeadAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
