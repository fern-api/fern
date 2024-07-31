using System.Net.Http;
using SeedExhaustive.Core;
using SeedExhaustive.InlinedRequests;
using SeedExhaustive.Types.Object;

#nullable enable

namespace SeedExhaustive.InlinedRequests;

public class InlinedRequestsClient
{
    private RawClient _client;

    public InlinedRequestsClient(RawClient client)
    {
        _client = client;
    }

    /// <summary>
    /// POST with custom object in request body, response is an object
    /// </summary>
    public async Task<ObjectWithOptionalField> PostWithObjectBodyandResponseAsync(
        PostWithObjectBody request,
        RequestOptions? options
    )
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = options?.BaseUrl ?? _client.Options.BaseUrl,
                Method = HttpMethod.Post,
                Path = "/req-bodies/object",
                Body = request,
                Options = options
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            return JsonUtils.Deserialize<ObjectWithOptionalField>(responseBody)!;
        }
        throw new Exception(responseBody);
    }
}
