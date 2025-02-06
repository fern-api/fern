using SeedMixedFileDirectory.Core;
using System.Threading.Tasks;
using SeedMixedFileDirectory;
using System.Threading;
using System.Net.Http;
using System.Text.Json;

    namespace SeedMixedFileDirectory.User.Events;

public partial class MetadataClient
{
    private RawClient _client;
    internal MetadataClient (RawClient client) {
        _client = client;
    }

    /// <summary>
    /// Get event metadata.
    /// </summary>
    /// <example>
    /// <code>
    /// await client.User.Events.Metadata.GetMetadataAsync(new GetEventMetadataRequest { Id = "id" });
    /// </code>
    /// </example>
    public async Task<Metadata> GetMetadataAsync(GetEventMetadataRequest request, RequestOptions? options = null, CancellationToken cancellationToken = default) {
        var _query = new Dictionary<string, object>();
        _query["id"] = request.Id;
        var response = await _client.MakeRequestAsync(new RawClient.JsonApiRequest{ 
                BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Get, Path = "/users/events/metadata/", Query = _query, Options = options
            }, cancellationToken).ConfigureAwait(false);
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400) {
            try
            {
                return JsonUtils.Deserialize<Metadata>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedMixedFileDirectoryException("Failed to deserialize response", e);
            }
        }
        
        throw new SeedMixedFileDirectoryApiException($"Error with status code {response.StatusCode}", response.StatusCode, responseBody);
    }

}
