using SeedCsharpElidePathParameters.Core;

namespace SeedCsharpElidePathParameters;

public partial class SeedCsharpElidePathParametersClient : ISeedCsharpElidePathParametersClient
{
    private readonly RawClient _client;

    public SeedCsharpElidePathParametersClient(ClientOptions? clientOptions = null)
    {
        clientOptions ??= new ClientOptions();
        var platformHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedCsharpElidePathParameters" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Ferncsharp-elide-path-parameters/0.0.1" },
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
        Bytes = new BytesClient(_client);
        EndpointHeaders = new EndpointHeadersClient(_client);
        Headers = new HeadersClient(_client);
    }

    public IBytesClient Bytes { get; }

    public IEndpointHeadersClient EndpointHeaders { get; }

    public IHeadersClient Headers { get; }
}
