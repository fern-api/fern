using System.Net.Http;
using SeedLiteral;
using SeedLiteral.Core;

#nullable enable

namespace SeedLiteral;

public class PathClient
{
    private RawClient _client;

    public PathClient(RawClient client)
    {
        _client = client;
    }

    public async Task<SendResponse> SendAsync(string id, RequestOptions? options)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = options?.BaseUrl ?? _client.Options.BaseUrl,
                Method = HttpMethod.Post,
                Path = $"path/{id}",
                Options = options
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            return JsonUtils.Deserialize<SendResponse>(responseBody)!;
        }
        throw new Exception(responseBody);
    }
}
