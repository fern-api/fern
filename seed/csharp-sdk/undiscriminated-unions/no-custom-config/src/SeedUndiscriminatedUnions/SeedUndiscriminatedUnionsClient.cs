using SeedUndiscriminatedUnions.Core;

namespace SeedUndiscriminatedUnions;

public partial class SeedUndiscriminatedUnionsClient : ISeedUndiscriminatedUnionsClient
{
    private readonly RawClient _client;

    public SeedUndiscriminatedUnionsClient(ClientOptions? clientOptions = null)
    {
        clientOptions ??= new ClientOptions();
        var platformHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedUndiscriminatedUnions" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernundiscriminated-unions/0.0.1" },
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
        Union = new UnionClient(_client);
    }

    public UnionClient Union { get; }
}
