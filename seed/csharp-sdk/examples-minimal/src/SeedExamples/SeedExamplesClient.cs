using SeedExamples.Core;

namespace SeedExamples;

public partial class SeedExamplesClient
{
    private readonly RawClient _client;

    public SeedExamplesClient(string token, ClientOptions? clientOptions = null)
    {
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedExamples" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernexamples-minimal/0.0.1" },
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
        Types = new TypesClient(_client);
    }

    public ServiceClient Service { get; init; }

    public TypesClient Types { get; init; }
}
