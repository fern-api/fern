using SeedUnions.Core;

namespace SeedUnions;

public partial class SeedUnionsClient : ISeedUnionsClient
{
    private readonly RawClient _client;

    public SeedUnionsClient(ClientOptions? clientOptions = null)
    {
        clientOptions ??= new ClientOptions();
        var platformHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedUnions" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernunions/0.0.1" },
            }
        );
        foreach (var header in platformHeaders)
        {
            if (!clientOptions.Headers.ContainsKey(header.Key))
            {
                clientOptions.Headers[header.Key] = header.Value;
            }
        }
        _client = new RawClient(clientOptions);
        Bigunion = new BigunionClient(_client);
        Union = new UnionClient(_client);
    }

    public BigunionClient Bigunion { get; }

    public UnionClient Union { get; }
}
