using SeedPlainText.Core;
using System.Threading.Tasks;
using System.Threading;
using System.Net.Http;

    namespace SeedPlainText;

public partial class ServiceClient
{
    private RawClient _client;
    internal ServiceClient (RawClient client) {
        _client = client;
    }

    /// <example>
    /// <code>
    /// await client.Service.GetTextAsync();
    /// </code>
    /// </example>
    public async Task<string> GetTextAsync(RequestOptions? options = null, CancellationToken cancellationToken = default) {
        var response = await _client.MakeRequestAsync(new RawClient.JsonApiRequest{ 
                BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Post, Path = "text", Options = options
            }, cancellationToken).ConfigureAwait(false);
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400) {
        return responseBody;
            }
        throw new SeedPlainTextApiException($"Error with status code {response.StatusCode}", response.StatusCode, responseBody);
    }

}
