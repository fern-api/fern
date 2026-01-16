using SeedApi.Core;

namespace SeedApi;

public partial class SeedApiClient : ISeedApiClient
{
    private readonly RawClient _client;

    public SeedApiClient(ClientOptions? clientOptions = null)
    {
        try
        {
            var defaultHeaders = new Headers(
                new Dictionary<string, string>()
                {
                    { "X-Fern-Language", "C#" },
                    { "X-Fern-SDK-Name", "SeedApi" },
                    { "X-Fern-SDK-Version", Version.Current },
                    { "User-Agent", "Ferncsharp-grpc-proto-exhaustive/0.0.1" },
                }
            );
            clientOptions ??= new ClientOptions();
            clientOptions.ExceptionHandler = new ExceptionHandler(
                new SeedApiExceptionInterceptor(clientOptions)
            );
            foreach (var header in defaultHeaders)
            {
                if (!clientOptions.Headers.ContainsKey(header.Key))
                {
                    clientOptions.Headers[header.Key] = header.Value;
                }
            }
            _client = new RawClient(clientOptions);
            Dataservice = new DataserviceClient(_client);
            Raw = new RawAccessClient(_client);
        }
        catch (Exception ex)
        {
            var interceptor = new SeedApiExceptionInterceptor(clientOptions);
            interceptor.Intercept(ex);
            throw;
        }
    }

    public DataserviceClient Dataservice { get; }

    public SeedApiClient.RawAccessClient Raw { get; }

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
