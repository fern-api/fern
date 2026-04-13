using SeedApi.Core;

namespace SeedApi;

public partial class NestedNoAuthApiClient : INestedNoAuthApiClient
{
    private readonly RawClient _client;

    internal NestedNoAuthApiClient(RawClient client)
    {
        _client = client;
    }

    /// <example><code>
    /// await client.NestedNoAuthApi.NestedNoAuthApiGetSomethingAsync();
    /// </code></example>
    public async Task NestedNoAuthApiGetSomethingAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedApi.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    Method = HttpMethod.Get,
                    Path = "nested-no-auth/get-something",
                    Headers = _headers,
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
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            throw new SeedApiApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }
}
