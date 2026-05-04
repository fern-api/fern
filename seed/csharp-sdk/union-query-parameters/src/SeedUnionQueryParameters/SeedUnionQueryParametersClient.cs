using SeedUnionQueryParameters.Core;

namespace SeedUnionQueryParameters;

public partial class SeedUnionQueryParametersClient : ISeedUnionQueryParametersClient
{
    private readonly RawClient _client;

    public SeedUnionQueryParametersClient(ClientOptions? clientOptions = null)
    {
        clientOptions ??= new ClientOptions();
        var platformHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedUnionQueryParameters" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernunion-query-parameters/0.0.1" },
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
        Events = new EventsClient(_client);
    }

    public IEventsClient Events { get; }
}
