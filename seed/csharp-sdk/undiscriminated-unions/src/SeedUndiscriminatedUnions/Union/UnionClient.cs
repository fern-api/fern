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
        > request,
        RequestOptions? options = null
    )
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Post,
                Path = "",
                Body = request,
                Options = options
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            try
            {
                return JsonUtils.Deserialize<
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
            catch (JsonException e)
            {
                throw new SeedUndiscriminatedUnionsException("Failed to deserialize response", e);
            }
        }

        throw new SeedUndiscriminatedUnionsApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            JsonUtils.Deserialize<object>(responseBody)
        );
    }

    public async Task<Dictionary<OneOf<KeyType, string>, string>> GetMetadataAsync(
        RequestOptions? options = null
    )
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Get,
                Path = "/metadata",
                Options = options
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            try
            {
                return JsonUtils.Deserialize<Dictionary<OneOf<KeyType, string>, string>>(
                    responseBody
                )!;
            }
            catch (JsonException e)
            {
                throw new SeedUndiscriminatedUnionsException("Failed to deserialize response", e);
            }
        }

        throw new SeedUndiscriminatedUnionsApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            JsonUtils.Deserialize<object>(responseBody)
        );
    }
}
