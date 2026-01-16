using SeedExamples.Core;
using SeedExamples;
using System.Text.Json;

namespace SeedExamples.Health;

public partial class ServiceClient : IServiceClient
{
    private RawClient _client;

    internal ServiceClient (RawClient client){
        _client = client;
        Raw = new RawAccessClient(_client);
    }

    public ServiceClient.RawAccessClient Raw { get; }

    /// <summary>
    /// This endpoint checks the health of a resource.
    /// </summary>
    /// <example><code>
    /// await client.Health.Service.CheckAsync("id-2sdx82h");
    /// </code></example>
    public async Task CheckAsync(string id, RequestOptions? options = null, CancellationToken cancellationToken = default) {
        var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Get, Path = string.Format("/check/{0}", ValueConvert.ToPathParameterString(id)), Options = options}, cancellationToken).ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedExamplesApiException($"Error with status code {response.StatusCode}", response.StatusCode, responseBody);
        }
    }

    /// <summary>
    /// This endpoint checks the health of the service.
    /// </summary>
    /// <example><code>
    /// await client.Health.Service.PingAsync();
    /// </code></example>
    public async Task<bool> PingAsync(RequestOptions? options = null, CancellationToken cancellationToken = default) {
        var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Get, Path = "/ping", Options = options}, cancellationToken).ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            try
            {
                return JsonUtils.Deserialize<bool>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedExamplesException("Failed to deserialize response", e);
            }
        }
        
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedExamplesApiException($"Error with status code {response.StatusCode}", response.StatusCode, responseBody);
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
        /// This endpoint checks the health of a resource.
        /// </summary>
        public async Task<RawResponse<object>> CheckAsync(string id, RequestOptions? options = null, CancellationToken cancellationToken = default) {
            var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Get, Path = string.Format("/check/{0}", ValueConvert.ToPathParameterString(id)), Options = options}, cancellationToken).ConfigureAwait(false);
            if (response.StatusCode is >= 200 and < 400)
            {
                return new RawResponse<object>
                {
                    StatusCode = (System.Net.HttpStatusCode)response.StatusCode,
                    Url = response.Raw.RequestMessage?.RequestUri!,
                    Headers = ExtractHeaders(response.Raw),
                    Body = new object()
                }
                };
            }
            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                throw new SeedExamplesApiException($"Error with status code {response.StatusCode}", response.StatusCode, responseBody);
            }
        }

        /// <summary>
        /// This endpoint checks the health of the service.
        /// </summary>
        public async Task<RawResponse<bool>> PingAsync(RequestOptions? options = null, CancellationToken cancellationToken = default) {
            var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Get, Path = "/ping", Options = options}, cancellationToken).ConfigureAwait(false);
            if (response.StatusCode is >= 200 and < 400)
            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                try
                {
                    var body = JsonUtils.Deserialize<bool>(responseBody)!;
                    return new RawResponse<bool>
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
                    throw new SeedExamplesException("Failed to deserialize response", e);
                }
            }
            
            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                throw new SeedExamplesApiException($"Error with status code {response.StatusCode}", response.StatusCode, responseBody);
            }
        }

    }

}
