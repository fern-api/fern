using SeedUnknownAsAny.Core;

namespace SeedUnknownAsAny;

public partial class SeedUnknownAsAnyClient
{
    private readonly RawClient _client;

    public SeedUnknownAsAnyClient(ClientOptions? clientOptions = null)
    {
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedUnknownAsAny" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernunknown/0.0.1" },
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
        Unknown = new UnknownClient(_client);
    }

    public UnknownClient Unknown { get; init; }
}
