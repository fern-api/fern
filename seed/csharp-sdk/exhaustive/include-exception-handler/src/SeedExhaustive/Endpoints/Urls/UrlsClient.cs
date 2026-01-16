using SeedExhaustive.Core;
using SeedExhaustive;
using System.Text.Json;

namespace SeedExhaustive.Endpoints;

public partial class UrlsClient : IUrlsClient
{
    private RawClient _client;

    internal UrlsClient (RawClient client){
        try{
            _client = client;
            Raw = new RawAccessClient(_client);
        }
        catch (Exception ex){
            client.Options.ExceptionHandler?.CaptureException(ex);
            throw;
        }
    }

    public UrlsClient.RawAccessClient Raw { get; }

    /// <example><code>
    /// await client.Endpoints.Urls.WithMixedCaseAsync();
    /// </code></example>
    public async Task<string> WithMixedCaseAsync(RequestOptions? options = null, CancellationToken cancellationToken = default) {
        return await _client.Options.ExceptionHandler.TryCatchAsync(async () =>
        {
            var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Get, Path = "/urls/MixedCase", Options = options}, cancellationToken).ConfigureAwait(false);
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
        ).ConfigureAwait(false);
    }

    /// <example><code>
    /// await client.Endpoints.Urls.NoEndingSlashAsync();
    /// </code></example>
    public async Task<string> NoEndingSlashAsync(RequestOptions? options = null, CancellationToken cancellationToken = default) {
        return await _client.Options.ExceptionHandler.TryCatchAsync(async () =>
        {
            var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Get, Path = "/urls/no-ending-slash", Options = options}, cancellationToken).ConfigureAwait(false);
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
        ).ConfigureAwait(false);
    }

    /// <example><code>
    /// await client.Endpoints.Urls.WithEndingSlashAsync();
    /// </code></example>
    public async Task<string> WithEndingSlashAsync(RequestOptions? options = null, CancellationToken cancellationToken = default) {
        return await _client.Options.ExceptionHandler.TryCatchAsync(async () =>
        {
            var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Get, Path = "/urls/with-ending-slash/", Options = options}, cancellationToken).ConfigureAwait(false);
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
        ).ConfigureAwait(false);
    }

    /// <example><code>
    /// await client.Endpoints.Urls.WithUnderscoresAsync();
    /// </code></example>
    public async Task<string> WithUnderscoresAsync(RequestOptions? options = null, CancellationToken cancellationToken = default) {
        return await _client.Options.ExceptionHandler.TryCatchAsync(async () =>
        {
            var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Get, Path = "/urls/with_underscores", Options = options}, cancellationToken).ConfigureAwait(false);
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
        ).ConfigureAwait(false);
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

        public async Task<RawResponse<string>> WithMixedCaseAsync(RequestOptions? options = null, CancellationToken cancellationToken = default) {
            return await _client.Options.ExceptionHandler.TryCatchAsync(async () =>
            {
                var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Get, Path = "/urls/MixedCase", Options = options}, cancellationToken).ConfigureAwait(false);
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
            ).ConfigureAwait(false);
        }

        public async Task<RawResponse<string>> NoEndingSlashAsync(RequestOptions? options = null, CancellationToken cancellationToken = default) {
            return await _client.Options.ExceptionHandler.TryCatchAsync(async () =>
            {
                var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Get, Path = "/urls/no-ending-slash", Options = options}, cancellationToken).ConfigureAwait(false);
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
            ).ConfigureAwait(false);
        }

        public async Task<RawResponse<string>> WithEndingSlashAsync(RequestOptions? options = null, CancellationToken cancellationToken = default) {
            return await _client.Options.ExceptionHandler.TryCatchAsync(async () =>
            {
                var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Get, Path = "/urls/with-ending-slash/", Options = options}, cancellationToken).ConfigureAwait(false);
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
            ).ConfigureAwait(false);
        }

        public async Task<RawResponse<string>> WithUnderscoresAsync(RequestOptions? options = null, CancellationToken cancellationToken = default) {
            return await _client.Options.ExceptionHandler.TryCatchAsync(async () =>
            {
                var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Get, Path = "/urls/with_underscores", Options = options}, cancellationToken).ConfigureAwait(false);
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
            ).ConfigureAwait(false);
        }

    }

}
