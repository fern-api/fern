using System.Text.Json;
using SeedExhaustive;
using SeedExhaustive.Types;

#nullable enable

namespace SeedExhaustive;

public class NoReqBodyClient
{
    private RawClient _client;

    public NoReqBodyClient(RawClient client)
    {
        _client = client;
    }

    public async Task<ObjectWithOptionalField> GetWithNoRequestBodyAsync()
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest { Method = HttpMethod.Get, Path = "/no-req-body" }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode >= 200 && response.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<ObjectWithOptionalField>(responseBody);
        }
        throw new Exception(responseBody);
    }

    public async Task<string> PostWithNoRequestBodyAsync()
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest { Method = HttpMethod.Post, Path = "/no-req-body" }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode >= 200 && response.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<string>(responseBody);
        }
        throw new Exception(responseBody);
    }
}
