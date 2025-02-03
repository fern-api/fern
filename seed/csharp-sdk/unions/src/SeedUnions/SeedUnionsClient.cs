using SeedUnions.Core;

namespace SeedUnions;

public partial class SeedUnionsClient
{
    private readonly RawClient _client;

    public SeedUnionsClient(ClientOptions? clientOptions = null)
    {
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedUnions" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernunions/0.0.1" },
            }
        );
        clientOptions ??= new ClientOptions();
        foreach (var header in defaultHeaders)
        {
            if (!clientOptions.Headers.ContainsKey(header.Key))
            {
                clientOptions.Headers[header.Key] = header.Value;
            }
        }
        _client = new RawClient(clientOptions);
        Types = new TypesClient(_client);
        Union = new UnionClient(_client);
    }

    public TypesClient Types { get; init; }

    public UnionClient Union { get; init; }
}
