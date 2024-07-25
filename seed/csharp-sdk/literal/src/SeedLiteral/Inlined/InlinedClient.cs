using System.Net.Http;
using SeedLiteral;
using SeedLiteral.Core;

#nullable enable

namespace SeedLiteral;

public class InlinedClient
{
    private RawClient _client;

    public InlinedClient(RawClient client)
    {
        _client = client;
    }

    public async Task<SendResponse> SendAsync(SendLiteralsInlinedRequest request)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseURL = _client.Options.BaseURL,
                Method = HttpMethod.Post,
                Path = "inlined",
                Body = request
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
