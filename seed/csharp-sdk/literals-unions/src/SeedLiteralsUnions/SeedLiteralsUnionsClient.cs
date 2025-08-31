using SeedLiteralsUnions.Core;

namespace SeedLiteralsUnions;

public partial class SeedLiteralsUnionsClient
{
    private readonly RawClient _client;

    public SeedLiteralsUnionsClient(ClientOptions? clientOptions = null)
    {
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedLiteralsUnions" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernliterals-unions/0.0.1" },
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
    }
}
