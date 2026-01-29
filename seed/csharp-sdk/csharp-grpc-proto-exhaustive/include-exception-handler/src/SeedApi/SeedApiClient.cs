using SeedApi.Core;

namespace SeedApi;

public partial class SeedApiClient : ISeedApiClient
{
    private readonly RawClient _client;

    public SeedApiClient(ClientOptions? clientOptions = null)
    {
        try
        {
            clientOptions ??= new ClientOptions();
            clientOptions.ExceptionHandler = new ExceptionHandler(
                new SeedApiExceptionInterceptor(clientOptions)
            );
            var platformHeaders = new Headers(
                new Dictionary<string, string>()
                {
                    { "X-Fern-Language", "C#" },
                    { "X-Fern-SDK-Name", "SeedApi" },
                    { "X-Fern-SDK-Version", Version.Current },
                    { "User-Agent", "Ferncsharp-grpc-proto-exhaustive/0.0.1" },
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
            Dataservice = new DataserviceClient(_client);
        }
        catch (Exception ex)
        {
            var interceptor = new SeedApiExceptionInterceptor(clientOptions);
            interceptor.Intercept(ex);
            throw;
        }
    }

    public DataserviceClient Dataservice { get; }
}
