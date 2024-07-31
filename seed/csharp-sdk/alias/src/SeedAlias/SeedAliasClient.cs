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
        await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Get,
                Path = $"/{typeId}",
                Options = options
            }
        );
    }
}
