using System.Net.Http;
using SeedTrace.Core;
using SeedTrace.V2;
using SeedTrace.V2.V3;

#nullable enable

namespace SeedTrace.V2;

public class V2Client
{
    private RawClient _client;

    public V2Client(RawClient client)
    {
        _client = client;
        Problem = new ProblemClient(_client);
        V3 = new V3Client(_client);
    }

    public ProblemClient Problem { get; }

    public V3Client V3 { get; }

    public async Task TestAsync(RequestOptions? options = null)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Get,
                Path = "",
                Options = options
            }
        );
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        throw new SeedTraceApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            JsonUtils.Deserialize<object>(responseBody)
        );
    }
}
