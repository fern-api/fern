using System.Text.Json;
using OneOf;
using SeedUndiscriminatedUnions;

#nullable enable

namespace SeedUndiscriminatedUnions;

public class UnionClient
{
    private RawClient _client;

    public UnionClient(RawClient client)
    {
        _client = client;
    }

    public async Task<
        OneOf<string, List<string>, int, List<int>, List<List<int>>, HashSet<string>>
    > GetAsync(
        OneOf<string, List<string>, int, List<int>, List<List<int>>, HashSet<string>> request
    )
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest
            {
                Method = HttpMethod.Post,
                Path = "",
                Body = request
            }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode >= 200 && response.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<
                OneOf<string, List<string>, int, List<int>, List<List<int>>, HashSet<string>>
            >(responseBody);
        }
        throw new Exception(responseBody);
    }
}
