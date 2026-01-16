using SeedExhaustive.Core;
using SeedExhaustive;
using System.Text.Json;

namespace SeedExhaustive.Endpoints.Params;

public partial class ParamsClient : IParamsClient
{
    private RawClient _client;

    internal ParamsClient (RawClient client){
        _client = client;
        Raw = new RawAccessClient(_client);
    }

    public ParamsClient.RawAccessClient Raw { get; }

    /// <summary>
    /// GET with path param
    /// </summary>
    /// <example><code>
    /// await client.Endpoints.Params.GetWithPathAsync("param");
    /// </code></example>
    public async Task<string> GetWithPathAsync(string param, RequestOptions? options = null, CancellationToken cancellationToken = default) {
        var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Get, Path = string.Format("/params/path/{0}", ValueConvert.ToPathParameterString(param)), Options = options}, cancellationToken).ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            try
            {
                return JsonUtils.Deserialize<string>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedExhaustiveException("Failed to deserialize response", e);
            }
        }
        
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedExhaustiveApiException($"Error with status code {response.StatusCode}", response.StatusCode, responseBody);
        }
    }

    /// <summary>
    /// GET with path param
    /// </summary>
    /// <example><code>
    /// await client.Endpoints.Params.GetWithInlinePathAsync(new GetWithInlinePath { Param = "param" });
    /// </code></example>
    public async Task<string> GetWithInlinePathAsync(GetWithInlinePath request, RequestOptions? options = null, CancellationToken cancellationToken = default) {
        var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Get, Path = string.Format("/params/path/{0}", ValueConvert.ToPathParameterString(request.Param)), Options = options}, cancellationToken).ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            try
            {
                return JsonUtils.Deserialize<string>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedExhaustiveException("Failed to deserialize response", e);
            }
        }
        
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedExhaustiveApiException($"Error with status code {response.StatusCode}", response.StatusCode, responseBody);
        }
    }

    /// <summary>
    /// GET with query param
    /// </summary>
    /// <example><code>
    /// await client.Endpoints.Params.GetWithQueryAsync(new GetWithQuery { Query = "query", Number = 1 });
    /// </code></example>
    public async Task GetWithQueryAsync(GetWithQuery request, RequestOptions? options = null, CancellationToken cancellationToken = default) {
        var _query = new Dictionary<string, object>();
        _query["query"] = request.Query;
        _query["number"] = request.Number.ToString();
        var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Get, Path = "/params", Query = _query, Options = options}, cancellationToken).ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedExhaustiveApiException($"Error with status code {response.StatusCode}", response.StatusCode, responseBody);
        }
    }

    /// <summary>
    /// GET with multiple of same query param
    /// </summary>
    /// <example><code>
    /// await client.Endpoints.Params.GetWithAllowMultipleQueryAsync(
    ///     new GetWithMultipleQuery { Query = ["query"], Number = [1] }
    /// );
    /// </code></example>
    public async Task GetWithAllowMultipleQueryAsync(GetWithMultipleQuery request, RequestOptions? options = null, CancellationToken cancellationToken = default) {
        var _query = new Dictionary<string, object>();
        _query["query"] = request.Query;
        _query["number"] = request.Number.Select(_value => _value.ToString()).ToList();
        var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Get, Path = "/params", Query = _query, Options = options}, cancellationToken).ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedExhaustiveApiException($"Error with status code {response.StatusCode}", response.StatusCode, responseBody);
        }
    }

    /// <summary>
    /// GET with path and query params
    /// </summary>
    /// <example><code>
    /// await client.Endpoints.Params.GetWithPathAndQueryAsync(
    ///     "param",
    ///     new GetWithPathAndQuery { Query = "query" }
    /// );
    /// </code></example>
    public async Task GetWithPathAndQueryAsync(string param, GetWithPathAndQuery request, RequestOptions? options = null, CancellationToken cancellationToken = default) {
        var _query = new Dictionary<string, object>();
        _query["query"] = request.Query;
        var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Get, Path = string.Format("/params/path-query/{0}", ValueConvert.ToPathParameterString(param)), Query = _query, Options = options}, cancellationToken).ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedExhaustiveApiException($"Error with status code {response.StatusCode}", response.StatusCode, responseBody);
        }
    }

    /// <summary>
    /// GET with path and query params
    /// </summary>
    /// <example><code>
    /// await client.Endpoints.Params.GetWithInlinePathAndQueryAsync(
    ///     new GetWithInlinePathAndQuery { Param = "param", Query = "query" }
    /// );
    /// </code></example>
    public async Task GetWithInlinePathAndQueryAsync(GetWithInlinePathAndQuery request, RequestOptions? options = null, CancellationToken cancellationToken = default) {
        var _query = new Dictionary<string, object>();
        _query["query"] = request.Query;
        var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Get, Path = string.Format("/params/path-query/{0}", ValueConvert.ToPathParameterString(request.Param)), Query = _query, Options = options}, cancellationToken).ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedExhaustiveApiException($"Error with status code {response.StatusCode}", response.StatusCode, responseBody);
        }
    }

    /// <summary>
    /// PUT to update with path param
    /// </summary>
    /// <example><code>
    /// await client.Endpoints.Params.ModifyWithPathAsync("param", "string");
    /// </code></example>
    public async Task<string> ModifyWithPathAsync(string param, string request, RequestOptions? options = null, CancellationToken cancellationToken = default) {
        var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Put, Path = string.Format("/params/path/{0}", ValueConvert.ToPathParameterString(param)), Body = request, Options = options}, cancellationToken).ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            try
            {
                return JsonUtils.Deserialize<string>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedExhaustiveException("Failed to deserialize response", e);
            }
        }
        
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedExhaustiveApiException($"Error with status code {response.StatusCode}", response.StatusCode, responseBody);
        }
    }

    /// <summary>
    /// PUT to update with path param
    /// </summary>
    /// <example><code>
    /// await client.Endpoints.Params.ModifyWithInlinePathAsync(
    ///     new ModifyResourceAtInlinedPath { Param = "param", Body = "string" }
    /// );
    /// </code></example>
    public async Task<string> ModifyWithInlinePathAsync(ModifyResourceAtInlinedPath request, RequestOptions? options = null, CancellationToken cancellationToken = default) {
        var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Put, Path = string.Format("/params/path/{0}", ValueConvert.ToPathParameterString(request.Param)), Body = request.Body, Options = options}, cancellationToken).ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            try
            {
                return JsonUtils.Deserialize<string>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedExhaustiveException("Failed to deserialize response", e);
            }
        }
        
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedExhaustiveApiException($"Error with status code {response.StatusCode}", response.StatusCode, responseBody);
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
        /// GET with path param
        /// </summary>
        public async Task<RawResponse<string>> GetWithPathAsync(string param, RequestOptions? options = null, CancellationToken cancellationToken = default) {
            var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Get, Path = string.Format("/params/path/{0}", ValueConvert.ToPathParameterString(param)), Options = options}, cancellationToken).ConfigureAwait(false);
            if (response.StatusCode is >= 200 and < 400)
            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                try
                {
                    var body = JsonUtils.Deserialize<string>(responseBody)!;
                    return new RawResponse<string>
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
                    throw new SeedExhaustiveException("Failed to deserialize response", e);
                }
            }
            
            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                throw new SeedExhaustiveApiException($"Error with status code {response.StatusCode}", response.StatusCode, responseBody);
            }
        }

        /// <summary>
        /// GET with path param
        /// </summary>
        public async Task<RawResponse<string>> GetWithInlinePathAsync(GetWithInlinePath request, RequestOptions? options = null, CancellationToken cancellationToken = default) {
            var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Get, Path = string.Format("/params/path/{0}", ValueConvert.ToPathParameterString(request.Param)), Options = options}, cancellationToken).ConfigureAwait(false);
            if (response.StatusCode is >= 200 and < 400)
            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                try
                {
                    var body = JsonUtils.Deserialize<string>(responseBody)!;
                    return new RawResponse<string>
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
                    throw new SeedExhaustiveException("Failed to deserialize response", e);
                }
            }
            
            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                throw new SeedExhaustiveApiException($"Error with status code {response.StatusCode}", response.StatusCode, responseBody);
            }
        }

        /// <summary>
        /// GET with query param
        /// </summary>
        public async Task<RawResponse<object>> GetWithQueryAsync(GetWithQuery request, RequestOptions? options = null, CancellationToken cancellationToken = default) {
            var _query = new Dictionary<string, object>();
            _query["query"] = request.Query;
            _query["number"] = request.Number.ToString();
            var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Get, Path = "/params", Query = _query, Options = options}, cancellationToken).ConfigureAwait(false);
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
                throw new SeedExhaustiveApiException($"Error with status code {response.StatusCode}", response.StatusCode, responseBody);
            }
        }

        /// <summary>
        /// GET with multiple of same query param
        /// </summary>
        public async Task<RawResponse<object>> GetWithAllowMultipleQueryAsync(GetWithMultipleQuery request, RequestOptions? options = null, CancellationToken cancellationToken = default) {
            var _query = new Dictionary<string, object>();
            _query["query"] = request.Query;
            _query["number"] = request.Number.Select(_value => _value.ToString()).ToList();
            var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Get, Path = "/params", Query = _query, Options = options}, cancellationToken).ConfigureAwait(false);
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
                throw new SeedExhaustiveApiException($"Error with status code {response.StatusCode}", response.StatusCode, responseBody);
            }
        }

        /// <summary>
        /// GET with path and query params
        /// </summary>
        public async Task<RawResponse<object>> GetWithPathAndQueryAsync(string param, GetWithPathAndQuery request, RequestOptions? options = null, CancellationToken cancellationToken = default) {
            var _query = new Dictionary<string, object>();
            _query["query"] = request.Query;
            var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Get, Path = string.Format("/params/path-query/{0}", ValueConvert.ToPathParameterString(param)), Query = _query, Options = options}, cancellationToken).ConfigureAwait(false);
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
                throw new SeedExhaustiveApiException($"Error with status code {response.StatusCode}", response.StatusCode, responseBody);
            }
        }

        /// <summary>
        /// GET with path and query params
        /// </summary>
        public async Task<RawResponse<object>> GetWithInlinePathAndQueryAsync(GetWithInlinePathAndQuery request, RequestOptions? options = null, CancellationToken cancellationToken = default) {
            var _query = new Dictionary<string, object>();
            _query["query"] = request.Query;
            var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Get, Path = string.Format("/params/path-query/{0}", ValueConvert.ToPathParameterString(request.Param)), Query = _query, Options = options}, cancellationToken).ConfigureAwait(false);
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
                throw new SeedExhaustiveApiException($"Error with status code {response.StatusCode}", response.StatusCode, responseBody);
            }
        }

        /// <summary>
        /// PUT to update with path param
        /// </summary>
        public async Task<RawResponse<string>> ModifyWithPathAsync(string param, string request, RequestOptions? options = null, CancellationToken cancellationToken = default) {
            var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Put, Path = string.Format("/params/path/{0}", ValueConvert.ToPathParameterString(param)), Body = request, Options = options}, cancellationToken).ConfigureAwait(false);
            if (response.StatusCode is >= 200 and < 400)
            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                try
                {
                    var body = JsonUtils.Deserialize<string>(responseBody)!;
                    return new RawResponse<string>
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
                    throw new SeedExhaustiveException("Failed to deserialize response", e);
                }
            }
            
            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                throw new SeedExhaustiveApiException($"Error with status code {response.StatusCode}", response.StatusCode, responseBody);
            }
        }

        /// <summary>
        /// PUT to update with path param
        /// </summary>
        public async Task<RawResponse<string>> ModifyWithInlinePathAsync(ModifyResourceAtInlinedPath request, RequestOptions? options = null, CancellationToken cancellationToken = default) {
            var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Put, Path = string.Format("/params/path/{0}", ValueConvert.ToPathParameterString(request.Param)), Body = request.Body, Options = options}, cancellationToken).ConfigureAwait(false);
            if (response.StatusCode is >= 200 and < 400)
            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                try
                {
                    var body = JsonUtils.Deserialize<string>(responseBody)!;
                    return new RawResponse<string>
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
                    throw new SeedExhaustiveException("Failed to deserialize response", e);
                }
            }
            
            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                throw new SeedExhaustiveApiException($"Error with status code {response.StatusCode}", response.StatusCode, responseBody);
            }
        }

    }

}
