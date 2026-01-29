using SeedNullable.Core;

namespace SeedNullable;

public partial class SeedNullableClient : ISeedNullableClient
{
    private readonly RawClient _client;

    public SeedNullableClient(ClientOptions? clientOptions = null)
    {
        clientOptions ??= new ClientOptions();
        var platformHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedNullable" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernnullable/0.0.1" },
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
        Nullable = new NullableClient(_client);
    }

    public NullableClient Nullable { get; }
}
