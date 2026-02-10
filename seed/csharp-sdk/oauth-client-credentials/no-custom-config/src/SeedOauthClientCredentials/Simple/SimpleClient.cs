using SeedOauthClientCredentials.Core;

namespace SeedOauthClientCredentials;

public partial class SimpleClient : ISimpleClient
{
    private RawClient _client;

    internal SimpleClient(RawClient client)
    {
        _client = client;
    }

    /// <example><code>
    /// await client.Simple.GetSomethingAsync();
    /// </code></example>
    public async Task GetSomethingAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedOauthClientCredentials.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Get,
                    Path = "/get-something",
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
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedOauthClientCredentialsApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }
}
