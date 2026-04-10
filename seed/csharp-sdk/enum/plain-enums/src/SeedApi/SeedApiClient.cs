using SeedApi.Core;

namespace SeedApi;

public partial class SeedApiClient : ISeedApiClient
{
    private readonly RawClient _client;

    public SeedApiClient(ClientOptions? clientOptions = null)
    {
        clientOptions ??= new ClientOptions();
        var platformHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedApi" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernenum/0.0.1" },
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
        Headers = new HeadersClient(_client);
        Inlinedrequest = new InlinedrequestClient(_client);
        Multipartform = new MultipartformClient(_client);
        Pathparam = new PathparamClient(_client);
        Queryparam = new QueryparamClient(_client);
    }

    public IHeadersClient Headers { get; }

    public IInlinedrequestClient Inlinedrequest { get; }

    public IMultipartformClient Multipartform { get; }

    public IPathparamClient Pathparam { get; }

    public IQueryparamClient Queryparam { get; }
}
