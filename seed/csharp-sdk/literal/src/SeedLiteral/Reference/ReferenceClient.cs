using System.Net.Http;
using SeedLiteral;
using SeedLiteral.Core;

#nullable enable

namespace SeedLiteral;

public class ReferenceClient
{
    private RawClient _client;

    public ReferenceClient(RawClient client)
    {
        _client = client;
    }

    public async Task<SendResponse> SendAsync(SendRequest request, RequestOptions? options)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = options?.BaseUrl ?? _client.Options.BaseUrl,
                Method = HttpMethod.Post,
                Path = "reference",
                Body = request,
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
