using System.Net.Http;
using SeedTrace.Core;

#nullable enable

namespace SeedTrace;

public class HomepageClient
{
    private RawClient _client;

    public HomepageClient(RawClient client)
    {
        _client = client;
    }

    public async Task<IEnumerable<string>> GetHomepageProblemsAsync(RequestOptions? options = null)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Get,
                Path = "/homepage-problems",
                Options = options
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            return JsonUtils.Deserialize<IEnumerable<string>>(responseBody)!;
        }
        throw new Exception(responseBody);
    }

    public async Task SetHomepageProblemsAsync(
        IEnumerable<string> request,
        RequestOptions? options = null
    )
    {
        await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Post,
                Path = "/homepage-problems",
                Body = request,
                Options = options
            }
        );
    }
}
