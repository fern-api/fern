using System;
using System.Net.Http;
using SeedAlias.Core;

#nullable enable

namespace SeedAlias;

public partial class SeedAliasClient
{
    private RawClient _client;

    public SeedAliasClient(ClientOptions? clientOptions = null)
    {
        _client = new RawClient(
            new Dictionary<string, string>() { { "X-Fern-Language", "C#" }, },
            new Dictionary<string, Func<string>>() { },
            clientOptions ?? new ClientOptions()
        );
    }

    public async Task GetAsync(string typeId, RequestOptions? options = null)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Get,
                Path = $"/{typeId}",
                Options = options
            }
        );
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        throw new SeedAliasApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            JsonUtils.Deserialize<object>(responseBody)
        );
    }
}
