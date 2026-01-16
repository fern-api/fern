using SeedMixedCase.Core;
using System.Text.Json;

namespace SeedMixedCase;

public partial class ServiceClient : IServiceClient
{
    private RawClient _client;

    internal ServiceClient (RawClient client){
        _client = client;
        Raw = new RawAccessClient(_client);
    }

    public ServiceClient.RawAccessClient Raw { get; }

    /// <example><code>
    /// await client.Service.GetResourceAsync("rsc-xyz");
    /// </code></example>
    public async Task<Resource> GetResourceAsync(string resourceId, RequestOptions? options = null, CancellationToken cancellationToken = default) {
        var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Get, Path = string.Format("/resource/{0}", ValueConvert.ToPathParameterString(resourceId)), Options = options}, cancellationToken).ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            try
            {
                return JsonUtils.Deserialize<Resource>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedMixedCaseException("Failed to deserialize response", e);
            }
        }
        
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedMixedCaseApiException($"Error with status code {response.StatusCode}", response.StatusCode, responseBody);
        }
    }

    /// <example><code>
    /// await client.Service.ListResourcesAsync(
    ///     new ListResourcesRequest { PageLimit = 10, BeforeDate = new DateOnly(2023, 1, 1) }
    /// );
    /// </code></example>
    public async Task<IEnumerable<Resource>> ListResourcesAsync(ListResourcesRequest request, RequestOptions? options = null, CancellationToken cancellationToken = default) {
        var _query = new Dictionary<string, object>();
        _query["page_limit"] = request.PageLimit.ToString();
        _query["beforeDate"] = request.BeforeDate.ToString(Constants.DateFormat);
        var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Get, Path = "/resource", Query = _query, Options = options}, cancellationToken).ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            try
            {
                return JsonUtils.Deserialize<IEnumerable<Resource>>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedMixedCaseException("Failed to deserialize response", e);
            }
        }
        
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedMixedCaseApiException($"Error with status code {response.StatusCode}", response.StatusCode, responseBody);
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

        public async Task<RawResponse<Resource>> GetResourceAsync(string resourceId, RequestOptions? options = null, CancellationToken cancellationToken = default) {
            var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Get, Path = string.Format("/resource/{0}", ValueConvert.ToPathParameterString(resourceId)), Options = options}, cancellationToken).ConfigureAwait(false);
            if (response.StatusCode is >= 200 and < 400)
            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                try
                {
                    var body = JsonUtils.Deserialize<Resource>(responseBody)!;
                    return new RawResponse<Resource>
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
                    throw new SeedMixedCaseException("Failed to deserialize response", e);
                }
            }
            
            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                throw new SeedMixedCaseApiException($"Error with status code {response.StatusCode}", response.StatusCode, responseBody);
            }
        }

        public async Task<RawResponse<IEnumerable<Resource>>> ListResourcesAsync(ListResourcesRequest request, RequestOptions? options = null, CancellationToken cancellationToken = default) {
            var _query = new Dictionary<string, object>();
            _query["page_limit"] = request.PageLimit.ToString();
            _query["beforeDate"] = request.BeforeDate.ToString(Constants.DateFormat);
            var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Get, Path = "/resource", Query = _query, Options = options}, cancellationToken).ConfigureAwait(false);
            if (response.StatusCode is >= 200 and < 400)
            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                try
                {
                    var body = JsonUtils.Deserialize<IEnumerable<Resource>>(responseBody)!;
                    return new RawResponse<IEnumerable<Resource>>
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
                    throw new SeedMixedCaseException("Failed to deserialize response", e);
                }
            }
            
            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                throw new SeedMixedCaseApiException($"Error with status code {response.StatusCode}", response.StatusCode, responseBody);
            }
        }

    }

}
