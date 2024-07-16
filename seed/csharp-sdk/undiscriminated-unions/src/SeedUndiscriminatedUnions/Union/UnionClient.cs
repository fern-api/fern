using System.Net.Http;
using System.Text.Json;
using OneOf;
using SeedUndiscriminatedUnions;
using SeedUndiscriminatedUnions.Core;

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
            return JsonSerializer.Deserialize<
                OneOf<
                    string,
                    IEnumerable<string>,
                    int,
                    IEnumerable<int>,
                    IEnumerable<IEnumerable<int>>,
                    HashSet<string>
                >
            >(responseBody)!;
        }
        throw new Exception(responseBody);
    }

    public async Task<Dictionary<OneOf<KeyType, string>, string>> GetMetadataAsync()
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest { Method = HttpMethod.Get, Path = "/metadata" }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            return JsonSerializer.Deserialize<Dictionary<OneOf<KeyType, string>, string>>(
                responseBody
            )!;
        }
        throw new Exception(responseBody);
    }
}
