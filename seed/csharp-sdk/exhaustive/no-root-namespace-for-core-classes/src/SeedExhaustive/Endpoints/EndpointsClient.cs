using SeedExhaustive.Core;

namespace SeedExhaustive.Endpoints;

public partial class EndpointsClient : IEndpointsClient
{
    private RawClient _client;

    internal EndpointsClient(RawClient client)
    {
        _client = client;
        Container = new ContainerClient(_client);
        ContentType = new ContentTypeClient(_client);
        Enum = new EnumClient(_client);
        HttpMethods = new HttpMethodsClient(_client);
        Object = new ObjectClient(_client);
        Params = new ParamsClient(_client);
        Primitive = new PrimitiveClient(_client);
        Put = new PutClient(_client);
        Union = new UnionClient(_client);
        Urls = new UrlsClient(_client);
        Raw = new RawAccessClient(_client);
    }

    public ContainerClient Container { get; }

    public ContentTypeClient ContentType { get; }

    public EnumClient Enum { get; }

    public HttpMethodsClient HttpMethods { get; }

    public ObjectClient Object { get; }

    public ParamsClient Params { get; }

    public PrimitiveClient Primitive { get; }

    public PutClient Put { get; }

    public UnionClient Union { get; }

    public UrlsClient Urls { get; }

    public EndpointsClient.RawAccessClient Raw { get; }

    public partial class RawAccessClient
    {
        private readonly RawClient _client;

        internal RawAccessClient(RawClient client)
        {
            _client = client;
        }

        private static IReadOnlyDictionary<string, IEnumerable<string>> ExtractHeaders(
            HttpResponseMessage response
        )
        {
            var headers = new Dictionary<string, IEnumerable<string>>(
                StringComparer.OrdinalIgnoreCase
            );
            foreach (var header in response.Headers)
            {
                headers[header.Key] = header.Value.ToList();
            }
            if (response.Content != null)
            {
                foreach (var header in response.Content.Headers)
                {
                    headers[header.Key] = header.Value.ToList();
                }
            }
            return headers;
        }
    }
}
