using SeedBytes.Core;
using System.Threading.Tasks;
using System.Threading;
using System.Net.Http;

    namespace SeedBytes;

public partial class ServiceClient
{
    private RawClient _client;
    internal ServiceClient (RawClient client) {
        _client = client;
    }

    public async Task UploadAsync(Stream request, RequestOptions? options = null, CancellationToken cancellationToken = default) {
        var response = await _client.MakeRequestAsync(new RawClient.StreamApiRequest{ 
                BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Post, Path = "upload-content", Body = request, ContentType = "application/octet-stream", Options = options
            }, cancellationToken).ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400) {
            return;
        }
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        throw new SeedBytesApiException($"Error with status code {response.StatusCode}", response.StatusCode, responseBody);
    }

}
