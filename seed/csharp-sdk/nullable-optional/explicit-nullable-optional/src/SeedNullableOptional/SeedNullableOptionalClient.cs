using SeedNullableOptional.Core;

namespace SeedNullableOptional;

public partial class SeedNullableOptionalClient : ISeedNullableOptionalClient
{
    private readonly RawClient _client;

    public SeedNullableOptionalClient(ClientOptions? clientOptions = null)
    {
        clientOptions ??= new ClientOptions();
        var platformHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedNullableOptional" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernnullable-optional/0.0.1" },
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
        NullableOptional = new NullableOptionalClient(_client);
    }

    public NullableOptionalClient NullableOptional { get; }
}
