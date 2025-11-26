using System.Net.Http.Headers;
using SeedHttpHead.Core;

namespace SeedHttpHead;

public partial class UserClient
{
    private RawClient _client;

    private RawUserClient _rawClient;

    internal UserClient(RawClient client)
    {
        _client = client;
        _rawClient = new RawUserClient(_client);
        WithRawResponse = _rawClient;
    }

    /// <summary>
    /// Access endpoints with raw HTTP response data (status code, headers).
    /// </summary>
    public RawUserClient WithRawResponse { get; }

    /// <example><code>
    /// await client.User.HeadAsync();
    /// </code></example>
    public async Task<HttpResponseHeaders> HeadAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return (
            await WithRawResponse.HeadAsync(options, cancellationToken).ConfigureAwait(false)
        ).Body;
    }

    /// <example><code>
    /// await client.User.ListAsync(new ListUsersRequest { Limit = 1 });
    /// </code></example>
    public async Task<IEnumerable<User>> ListAsync(
        ListUsersRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return (
            await WithRawResponse
                .ListAsync(request, options, cancellationToken)
                .ConfigureAwait(false)
        ).Body;
    }
}
