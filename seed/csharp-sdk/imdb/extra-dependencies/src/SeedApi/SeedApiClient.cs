using SeedApi;
using SeedApi.Core;

#nullable enable

namespace SeedApi;

public partial class SeedApiClient
{
    private RawClient _client;

    public SeedApiClient(string token, ClientOptions? clientOptions = null)
    {
        _client = new RawClient(
            new Dictionary<string, string>() { { "X-Fern-Language", "C#" }, },
            clientOptions ?? new ClientOptions()
        );
        Imdb = new ImdbClient(_client);
    }

    public ImdbClient Imdb { get; }
}
