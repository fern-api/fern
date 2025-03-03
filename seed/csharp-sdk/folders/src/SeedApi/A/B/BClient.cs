using System.Net.Http;
using System.Threading;
using global::System.Threading.Tasks;
using SeedApi;
using SeedApi.Core;

namespace SeedApi.A.B;

public partial class BClient
{
    private RawClient _client;

    internal BClient(RawClient client)
    {
        _client = client;
    }

    /// <example>
    /// <code>
    /// await client.A.B.FooAsync();
    /// </code>
    /// </example>
    public async global::System.Threading.Tasks.Task FooAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new RawClient.JsonApiRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Post,
                    Path = "",
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
            throw new SeedApiApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }
}
