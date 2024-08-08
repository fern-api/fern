using System;
using System.Net.Http;
using SeedCsharpNamespaceConflict.A;
using SeedCsharpNamespaceConflict.B;
using SeedCsharpNamespaceConflict.C;
using SeedCsharpNamespaceConflict.Core;

#nullable enable

namespace SeedCsharpNamespaceConflict;

public partial class SeedCsharpNamespaceConflictClient
{
    private RawClient _client;

    public SeedCsharpNamespaceConflictClient(ClientOptions? clientOptions = null)
    {
        _client = new RawClient(
            new Dictionary<string, string>() { { "X-Fern-Language", "C#" }, },
            new Dictionary<string, Func<string>>() { },
            clientOptions ?? new ClientOptions()
        );
        A = new AClient(_client);
        B = new BClient(_client);
        C = new CClient(_client);
    }

    public AClient A { get; init; }

    public BClient B { get; init; }

    public CClient C { get; init; }

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
        throw new SeedCsharpNamespaceConflictApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            JsonUtils.Deserialize<object>(responseBody)
        );
    }
}
