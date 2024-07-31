using System.Net.Http;
using SeedEnum;
using SeedEnum.Core;

#nullable enable

namespace SeedEnum;

public class InlinedRequestClient
{
    private RawClient _client;

    public InlinedRequestClient(RawClient client)
    {
        _client = client;
    }

    public async Task SendAsync(SendEnumInlinedRequest request, RequestOptions? options = null)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Post,
                Path = "inlined",
                Body = request,
                Options = options
            }
        );
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        throw new SeedEnumApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            JsonUtils.Deserialize<object>(responseBody)
        );
    }
}
