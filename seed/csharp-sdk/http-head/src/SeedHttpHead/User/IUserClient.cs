using System.Net.Http.Headers;

namespace SeedHttpHead;

public partial interface IUserClient
{
    Task<HttpResponseHeaders> HeadAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task<IEnumerable<User>> ListAsync(
        ListUsersRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
