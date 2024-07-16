using System.Net.Http;
using System.Text.Json;
using SeedObjectsWithImports.Core;

#nullable enable

namespace SeedObjectsWithImports;

public class OptionalClient
{
    private RawClient _client;

    public OptionalClient(RawClient client)
    {
        _client = client;
    }

    public async Task<string> SendOptionalBodyAsync(Dictionary<string, object>? request)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                Method = HttpMethod.Post,
                Path = "send-optional-body",
                Body = request
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            return JsonSerializer.Deserialize<string>(responseBody)!;
        }
        throw new Exception(responseBody);
    }
}
