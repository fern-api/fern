using SeedMixedCase.Core;

namespace SeedMixedCase;

public partial class SeedMixedCaseClient
{
    private readonly RawClient _client;

    public SeedMixedCaseClient(ClientOptions? clientOptions = null)
    {
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedMixedCase" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernmixed-case/0.0.1" },
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
        Service = new ServiceClient(_client);
    }

    public ServiceClient Service { get; init; }
}
