using System.Net.Http;
using System.Text.Json;
using SeedUnknownAsAny.Core;

#nullable enable

namespace SeedUnknownAsAny;

public class UnknownClient
{
    private RawClient _client;

    public UnknownClient(RawClient client)
    {
        _client = client;
    }

    public async Task<IEnumerable<object>> PostAsync(object request)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                Method = HttpMethod.Post,
                Path = "",
                Body = request
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            return JsonSerializer.Deserialize<IEnumerable<object>>(responseBody)!;
        }
        throw new Exception(responseBody);
    }
}
