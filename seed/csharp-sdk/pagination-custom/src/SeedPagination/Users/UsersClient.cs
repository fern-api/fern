using SeedPagination.Core;

namespace SeedPagination;

public partial class UsersClient
{
    private RawClient _client;

    internal UsersClient(RawClient client)
    {
        _client = client;
    }

    /// <example><code>
    /// await client.Users.ListUsernamesCustomAsync(
    ///     new ListUsernamesRequestCustom { StartingAfter = "starting_after" }
    /// );
    /// </code></example>
    public async Task<SeedPaginationPager<string>> ListUsernamesCustomAsync(
        ListUsernamesRequestCustom request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _query = new Dictionary<string, object>();
        if (request.StartingAfter != null)
        {
            _query["starting_after"] = request.StartingAfter;
        }
        var httpRequest = _client.CreateHttpRequest(
            new JsonRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Get,
                Path = "/users",
                Query = _query,
                Options = options,
            }
        );
        var sendRequest = async (
            HttpRequestMessage httpRequest,
            CancellationToken cancellationToken
        ) =>
        {
            var response = await _client
                .SendRequestAsync(httpRequest, options, cancellationToken)
                .ConfigureAwait(false);
            if (response.StatusCode is >= 200 and < 400)
            {
                return response.Raw;
            }

            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                throw new SeedPaginationApiException(
                    $"Error with status code {response.StatusCode}",
                    response.StatusCode,
                    responseBody
                );
            }
        };
        return await SeedPaginationPagerFactory
            .CreateAsync<string>(
                new SeedPaginationPagerContext()
                {
                    SendRequest = sendRequest,
                    InitialHttpRequest = httpRequest,
                    ClientOptions = _client.Options,
                    RequestOptions = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
    }
}
