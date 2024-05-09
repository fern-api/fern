using System.Text.Json;
using SeedExhaustive;
using SeedExhaustive.Types;

namespace SeedExhaustive;

public class NoReqBodyClient
{
    private RawClient _client;

    public NoReqBodyClient(RawClient client)
    {
        _client = client;
    }

    public async ObjectWithOptionalField GetWithNoRequestBodyAsync()
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest { Method = HttpMethod.Get, Path = "" }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (responseBody.StatusCode >= 200 && responseBody.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<ObjectWithOptionalField>(responseBody);
        }
        throw new Exception();
    }

    public async string PostWithNoRequestBodyAsync()
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest { Method = HttpMethod.Post, Path = "" }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (responseBody.StatusCode >= 200 && responseBody.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<string>(responseBody);
        }
        throw new Exception();
    }
}
