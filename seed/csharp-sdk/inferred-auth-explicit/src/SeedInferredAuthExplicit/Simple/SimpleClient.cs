using SeedInferredAuthExplicit.Core;

namespace SeedInferredAuthExplicit;

public partial class SimpleClient
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
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Get,
                    Path = "/get-something",
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
            throw new SeedInferredAuthExplicitApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }
}
