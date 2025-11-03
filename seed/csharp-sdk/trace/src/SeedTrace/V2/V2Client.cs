using SeedTrace;
using SeedTrace.Core;
using SeedTrace.V2.V3;

namespace SeedTrace.V2;

public partial class V2Client
{
    private RawClient _client;

    internal V2Client(RawClient client)
    {
        _client = client;
        Problem = new ProblemClient(_client);
        V3 = new V3Client(_client);
    }

    public ProblemClient Problem { get; }

    public V3Client V3 { get; }

    /// <example><code>
    /// await client.V2.TestAsync();
    /// </code></example>
    public async Task TestAsync(
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
            throw new SeedTraceApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }
}
