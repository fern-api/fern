using System.Text.Json;
using OneOf;
using SeedUndiscriminatedUnions;

namespace SeedUndiscriminatedUnions;

public class UnionClient
{
    private RawClient _client;

    public UnionClient(RawClient client)
    {
        _client = client;
    }

    public async OneOf<
        string,
        List<List<string>>,
        int,
        List<List<int>>,
        List<List<List<List<int>>>>
    > GetAsync(
        OneOf<string, List<List<string>>, int, List<List<int>>, List<List<List<List<int>>>>> request
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
        if (responseBody.StatusCode >= 200 && responseBody.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<
                OneOf<string, List<List<string>>, int, List<List<int>>, List<List<List<List<int>>>>>
            >(responseBody);
        }
        throw new Exception();
    }
}
