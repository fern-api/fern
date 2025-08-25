using SeedNullableOptional.Core;

namespace SeedNullableOptional;

public partial class SeedNullableOptionalClient
{
    private readonly RawClient _client;

    public SeedNullableOptionalClient(ClientOptions? clientOptions = null)
    {
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedNullableOptional" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernnullable-optional/0.0.1" },
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
        NullableOptional = new NullableOptionalClient(_client);
    }

    public NullableOptionalClient NullableOptional { get; }
}
