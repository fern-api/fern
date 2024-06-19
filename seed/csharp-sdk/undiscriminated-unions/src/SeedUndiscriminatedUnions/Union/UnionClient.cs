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
        OneOf<
            string,
            IEnumerable<string>,
            int,
            IEnumerable<int>,
            IEnumerable<IEnumerable<int>>,
            HashSet<string>
        >
    > GetAsync(
        OneOf<
            string,
            IEnumerable<string>,
            int,
            IEnumerable<int>,
            IEnumerable<IEnumerable<int>>,
            HashSet<string>
        > request
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
                OneOf<
                    string,
                    IEnumerable<string>,
                    int,
                    IEnumerable<int>,
                    IEnumerable<IEnumerable<int>>,
                    HashSet<string>
                >
            >(responseBody);
        }
        throw new Exception(responseBody);
    }

    public async Task<Dictionary<OneOf<KeyType, string>, string>> GetMetadataAsync()
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest { Method = HttpMethod.Get, Path = "/metadata" }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode >= 200 && response.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<Dictionary<OneOf<KeyType, string>, string>>(
                responseBody
            );
        }
        throw new Exception(responseBody);
    }
}
