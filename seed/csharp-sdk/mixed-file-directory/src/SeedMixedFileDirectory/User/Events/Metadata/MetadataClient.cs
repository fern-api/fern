using SeedMixedFileDirectory.Core;
using SeedMixedFileDirectory;
using System.Text.Json;

namespace SeedMixedFileDirectory.User_.Events;

public partial class MetadataClient : IMetadataClient
{
    private RawClient _client;

    internal MetadataClient (RawClient client){
        _client = client;
        Raw = new RawAccessClient(_client);
    }

    public MetadataClient.RawAccessClient Raw { get; }

    /// <summary>
    /// Get event metadata.
    /// </summary>
    /// <example><code>
    /// await client.User.Events.Metadata.GetMetadataAsync(new GetEventMetadataRequest { Id = "id" });
    /// </code></example>
    public async Task<Metadata> GetMetadataAsync(GetEventMetadataRequest request, RequestOptions? options = null, CancellationToken cancellationToken = default) {
        var _query = new Dictionary<string, object>();
        _query["id"] = request.Id;
        var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Get, Path = "/users/events/metadata/", Query = _query, Options = options}, cancellationToken).ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            try
            {
                return JsonUtils.Deserialize<Metadata>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedMixedFileDirectoryException("Failed to deserialize response", e);
            }
        }
        
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedMixedFileDirectoryApiException($"Error with status code {response.StatusCode}", response.StatusCode, responseBody);
        }
    }

    public partial class RawAccessClient
    {
        private readonly RawClient _client;
        internal RawAccessClient (RawClient client){
            _client = client;
        }

        private static IReadOnlyDictionary<string, IEnumerable<string>> ExtractHeaders(HttpResponseMessage response) {
            var headers = new Dictionary<string, IEnumerable<string>>(StringComparer.OrdinalIgnoreCase);
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

        /// <summary>
        /// Get event metadata.
        /// </summary>
        public async Task<RawResponse<Metadata>> GetMetadataAsync(GetEventMetadataRequest request, RequestOptions? options = null, CancellationToken cancellationToken = default) {
            var _query = new Dictionary<string, object>();
            _query["id"] = request.Id;
            var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Get, Path = "/users/events/metadata/", Query = _query, Options = options}, cancellationToken).ConfigureAwait(false);
            if (response.StatusCode is >= 200 and < 400)
            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                try
                {
                    var body = JsonUtils.Deserialize<Metadata>(responseBody)!;
                    return new RawResponse<Metadata>
                    {
                        StatusCode = (System.Net.HttpStatusCode)response.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri!,
                        Headers = ExtractHeaders(response.Raw),
                        Body = body
                    }
                    };
                }
                catch (JsonException e)
                {
                    throw new SeedMixedFileDirectoryException("Failed to deserialize response", e);
                }
            }
            
            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                throw new SeedMixedFileDirectoryApiException($"Error with status code {response.StatusCode}", response.StatusCode, responseBody);
            }
        }

    }

}
