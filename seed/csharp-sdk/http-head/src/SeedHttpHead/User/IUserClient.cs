using System.Net.Http.Headers;

namespace SeedHttpHead;

public partial interface IUserClient
{
    WithRawResponseTask<HttpResponseHeaders> HeadAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<IEnumerable<User>> ListAsync(
        ListUsersRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
