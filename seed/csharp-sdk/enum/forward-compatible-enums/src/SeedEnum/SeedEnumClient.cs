using SeedEnum.Core;

namespace SeedEnum;

public partial class SeedEnumClient
{
    private readonly RawClient _client;

    public SeedEnumClient(ClientOptions? clientOptions = null)
    {
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedEnum" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernenum/0.0.1" },
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
        Headers = new HeadersClient(_client);
        InlinedRequest = new InlinedRequestClient(_client);
        MultipartForm = new MultipartFormClient(_client);
        PathParam = new PathParamClient(_client);
        QueryParam = new QueryParamClient(_client);
    }

    public HeadersClient Headers { get; }

    public InlinedRequestClient InlinedRequest { get; }

    public MultipartFormClient MultipartForm { get; }

    public PathParamClient PathParam { get; }

    public QueryParamClient QueryParam { get; }
}
