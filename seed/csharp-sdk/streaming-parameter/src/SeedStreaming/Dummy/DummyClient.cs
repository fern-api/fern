using SeedStreaming.Core;
using System.Threading.Tasks;
using System.Threading;
using System.Net.Http;

    namespace SeedStreaming;

public partial class DummyClient
{
    private RawClient _client;
    internal DummyClient (RawClient client) {
        _client = client;
    }

    /// <example>
    /// <code>
    /// await client.Dummy.GenerateAsync(new GenerateRequest { Stream = false, NumEvents = 5 });
    /// </code>
    /// </example>
    public async Task GenerateAsync(GenerateRequest request, RequestOptions? options = null, CancellationToken cancellationToken = default) {
        var response = await _client.MakeRequestAsync(new RawClient.JsonApiRequest{ 
                BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Post, Path = "generate", Body = request, Options = options
            }, cancellationToken).ConfigureAwait(false);
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        throw new SeedStreamingApiException($"Error with status code {response.StatusCode}", response.StatusCode, responseBody);
    }

}
