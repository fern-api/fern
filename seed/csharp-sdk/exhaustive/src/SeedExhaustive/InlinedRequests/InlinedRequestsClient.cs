using System.Text.Json;
using SeedExhaustive;
using SeedExhaustive.Core;
using SeedExhaustive.Types;

#nullable enable

namespace SeedExhaustive;

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
        PostWithObjectBody request
    )
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                Method = HttpMethod.Post,
                Path = "/req-bodies/object",
                Body = request
            }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode >= 200 && response.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<ObjectWithOptionalField>(responseBody);
        }
        throw new Exception(responseBody);
    }
}
