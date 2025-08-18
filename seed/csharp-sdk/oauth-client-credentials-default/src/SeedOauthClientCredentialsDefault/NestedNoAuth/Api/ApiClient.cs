using System.Net.Http;
using System.Threading;
using global::System.Threading.Tasks;
using SeedOauthClientCredentialsDefault;
using SeedOauthClientCredentialsDefault.Core;

namespace SeedOauthClientCredentialsDefault.NestedNoAuth;

public partial class ApiClient
{
    private RawClient _client;

    internal ApiClient(RawClient client)
    {
        _client = client;
    }

    /// <example><code>
    /// await client.NestedNoAuth.Api.GetSomethingAsync();
    /// </code></example>
    public async global::System.Threading.Tasks.Task GetSomethingAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Get,
                    Path = "/nested-no-auth/get-something",
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedOauthClientCredentialsDefaultApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }
}
