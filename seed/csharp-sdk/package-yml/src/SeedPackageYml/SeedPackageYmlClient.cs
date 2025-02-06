using SeedPackageYml.Core;
using System.Threading.Tasks;
using System.Threading;
using System.Net.Http;
using System.Text.Json;

    namespace SeedPackageYml;

public partial class SeedPackageYmlClient
{
    private readonly RawClient _client;

    public SeedPackageYmlClient (ClientOptions? clientOptions = null) {
        var defaultHeaders = new Headers(
            new Dictionary<string, string>() {
                { "X-Fern-Language", "C#" }, 
                { "X-Fern-SDK-Name", "SeedPackageYml" }, 
                { "X-Fern-SDK-Version", Version.Current }, 
                { "User-Agent", "Fernpackage-yml/0.0.1" }, 
            }
        );
        clientOptions ??= new ClientOptions(
            
        );
        foreach (var header in defaultHeaders) {
            if (!clientOptions.Headers.ContainsKey(header.Key)) {
                clientOptions.Headers[header.Key] = header.Value;
            }
        }
        _client = 
        new RawClient(
            clientOptions
        );
        Service = 
        new ServiceClient(
            _client
        );
    }

    public ServiceClient Service { get; init; }

    /// <example>
    /// <code>
    /// await client.EchoAsync("id-ksfd9c1", new EchoRequest { Name = "Hello world!", Size = 20 });
    /// </code>
    /// </example>
    public async Task<string> EchoAsync(string id, EchoRequest request, RequestOptions? options = null, CancellationToken cancellationToken = default) {
        var response = await _client.MakeRequestAsync(new RawClient.JsonApiRequest{ 
                BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Post, Path = $"/{id}/", Body = request, Options = options
            }, cancellationToken).ConfigureAwait(false);
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400) {
            try
            {
                return JsonUtils.Deserialize<string>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedPackageYmlException("Failed to deserialize response", e);
            }
        }
        
        throw new SeedPackageYmlApiException($"Error with status code {response.StatusCode}", response.StatusCode, responseBody);
    }

}
