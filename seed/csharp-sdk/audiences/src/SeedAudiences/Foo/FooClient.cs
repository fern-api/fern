using System.Text.Json;
using SeedAudiences;

namespace SeedAudiences;

public class FooClient
{
    private RawClient _client;

    public FooClient(RawClient client)
    {
        _client = client;
    }

    public async Task<ImportingType> FindAsync(FindRequest request)
    {
        var _query = new Dictionary<string, object>() { };
        if (request.OptionalString != null)
        {
            _query["optionalString"] = request.OptionalString;
        }
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest
            {
                Method = HttpMethod.Post,
                Path = "",
                Query = _query
            }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode >= 200 && response.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<ImportingType>(responseBody);
        }
        throw new Exception();
    }
}
