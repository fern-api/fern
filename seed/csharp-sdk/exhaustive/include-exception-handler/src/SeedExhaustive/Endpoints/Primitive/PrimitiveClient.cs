using SeedExhaustive.Core;
using SeedExhaustive;
using System.Text.Json;

namespace SeedExhaustive.Endpoints;

public partial class PrimitiveClient : IPrimitiveClient
{
    private RawClient _client;

    internal PrimitiveClient (RawClient client){
        try{
            _client = client;
            Raw = new RawAccessClient(_client);
        }
        catch (Exception ex){
            client.Options.ExceptionHandler?.CaptureException(ex);
            throw;
        }
    }

    public PrimitiveClient.RawAccessClient Raw { get; }

    /// <example><code>
    /// await client.Endpoints.Primitive.GetAndReturnStringAsync("string");
    /// </code></example>
    public async Task<string> GetAndReturnStringAsync(string request, RequestOptions? options = null, CancellationToken cancellationToken = default) {
        return await _client.Options.ExceptionHandler.TryCatchAsync(async () =>
        {
            var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Post, Path = "/primitive/string", Body = request, Options = options}, cancellationToken).ConfigureAwait(false);
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
    /// await client.Endpoints.Primitive.GetAndReturnIntAsync(1);
    /// </code></example>
    public async Task<int> GetAndReturnIntAsync(int request, RequestOptions? options = null, CancellationToken cancellationToken = default) {
        return await _client.Options.ExceptionHandler.TryCatchAsync(async () =>
        {
            var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Post, Path = "/primitive/integer", Body = request, Options = options}, cancellationToken).ConfigureAwait(false);
            if (response.StatusCode is >= 200 and < 400)
            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                try
                {
                    return JsonUtils.Deserialize<int>(responseBody)!;
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
    /// await client.Endpoints.Primitive.GetAndReturnLongAsync(1000000);
    /// </code></example>
    public async Task<long> GetAndReturnLongAsync(long request, RequestOptions? options = null, CancellationToken cancellationToken = default) {
        return await _client.Options.ExceptionHandler.TryCatchAsync(async () =>
        {
            var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Post, Path = "/primitive/long", Body = request, Options = options}, cancellationToken).ConfigureAwait(false);
            if (response.StatusCode is >= 200 and < 400)
            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                try
                {
                    return JsonUtils.Deserialize<long>(responseBody)!;
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
    /// await client.Endpoints.Primitive.GetAndReturnDoubleAsync(1.1);
    /// </code></example>
    public async Task<double> GetAndReturnDoubleAsync(double request, RequestOptions? options = null, CancellationToken cancellationToken = default) {
        return await _client.Options.ExceptionHandler.TryCatchAsync(async () =>
        {
            var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Post, Path = "/primitive/double", Body = request, Options = options}, cancellationToken).ConfigureAwait(false);
            if (response.StatusCode is >= 200 and < 400)
            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                try
                {
                    return JsonUtils.Deserialize<double>(responseBody)!;
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
    /// await client.Endpoints.Primitive.GetAndReturnBoolAsync(true);
    /// </code></example>
    public async Task<bool> GetAndReturnBoolAsync(bool request, RequestOptions? options = null, CancellationToken cancellationToken = default) {
        return await _client.Options.ExceptionHandler.TryCatchAsync(async () =>
        {
            var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Post, Path = "/primitive/boolean", Body = request, Options = options}, cancellationToken).ConfigureAwait(false);
            if (response.StatusCode is >= 200 and < 400)
            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                try
                {
                    return JsonUtils.Deserialize<bool>(responseBody)!;
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
    /// await client.Endpoints.Primitive.GetAndReturnDatetimeAsync(
    ///     new DateTime(2024, 01, 15, 09, 30, 00, 000)
    /// );
    /// </code></example>
    public async Task<DateTime> GetAndReturnDatetimeAsync(DateTime request, RequestOptions? options = null, CancellationToken cancellationToken = default) {
        return await _client.Options.ExceptionHandler.TryCatchAsync(async () =>
        {
            var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Post, Path = "/primitive/datetime", Body = request, Options = options}, cancellationToken).ConfigureAwait(false);
            if (response.StatusCode is >= 200 and < 400)
            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                try
                {
                    return JsonUtils.Deserialize<DateTime>(responseBody)!;
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
    /// await client.Endpoints.Primitive.GetAndReturnDateAsync(new DateOnly(2023, 1, 15));
    /// </code></example>
    public async Task<DateOnly> GetAndReturnDateAsync(DateOnly request, RequestOptions? options = null, CancellationToken cancellationToken = default) {
        return await _client.Options.ExceptionHandler.TryCatchAsync(async () =>
        {
            var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Post, Path = "/primitive/date", Body = request, Options = options}, cancellationToken).ConfigureAwait(false);
            if (response.StatusCode is >= 200 and < 400)
            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                try
                {
                    return JsonUtils.Deserialize<DateOnly>(responseBody)!;
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
    /// await client.Endpoints.Primitive.GetAndReturnUuidAsync("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32");
    /// </code></example>
    public async Task<string> GetAndReturnUuidAsync(string request, RequestOptions? options = null, CancellationToken cancellationToken = default) {
        return await _client.Options.ExceptionHandler.TryCatchAsync(async () =>
        {
            var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Post, Path = "/primitive/uuid", Body = request, Options = options}, cancellationToken).ConfigureAwait(false);
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
    /// await client.Endpoints.Primitive.GetAndReturnBase64Async("SGVsbG8gd29ybGQh");
    /// </code></example>
    public async Task<string> GetAndReturnBase64Async(string request, RequestOptions? options = null, CancellationToken cancellationToken = default) {
        return await _client.Options.ExceptionHandler.TryCatchAsync(async () =>
        {
            var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Post, Path = "/primitive/base64", Body = request, Options = options}, cancellationToken).ConfigureAwait(false);
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

        public async Task<RawResponse<string>> GetAndReturnStringAsync(string request, RequestOptions? options = null, CancellationToken cancellationToken = default) {
            return await _client.Options.ExceptionHandler.TryCatchAsync(async () =>
            {
                var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Post, Path = "/primitive/string", Body = request, Options = options}, cancellationToken).ConfigureAwait(false);
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

        public async Task<RawResponse<int>> GetAndReturnIntAsync(int request, RequestOptions? options = null, CancellationToken cancellationToken = default) {
            return await _client.Options.ExceptionHandler.TryCatchAsync(async () =>
            {
                var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Post, Path = "/primitive/integer", Body = request, Options = options}, cancellationToken).ConfigureAwait(false);
                if (response.StatusCode is >= 200 and < 400)
                {
                    var responseBody = await response.Raw.Content.ReadAsStringAsync();
                    try
                    {
                        var body = JsonUtils.Deserialize<int>(responseBody)!;
                        return new RawResponse<int>
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

        public async Task<RawResponse<long>> GetAndReturnLongAsync(long request, RequestOptions? options = null, CancellationToken cancellationToken = default) {
            return await _client.Options.ExceptionHandler.TryCatchAsync(async () =>
            {
                var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Post, Path = "/primitive/long", Body = request, Options = options}, cancellationToken).ConfigureAwait(false);
                if (response.StatusCode is >= 200 and < 400)
                {
                    var responseBody = await response.Raw.Content.ReadAsStringAsync();
                    try
                    {
                        var body = JsonUtils.Deserialize<long>(responseBody)!;
                        return new RawResponse<long>
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

        public async Task<RawResponse<double>> GetAndReturnDoubleAsync(double request, RequestOptions? options = null, CancellationToken cancellationToken = default) {
            return await _client.Options.ExceptionHandler.TryCatchAsync(async () =>
            {
                var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Post, Path = "/primitive/double", Body = request, Options = options}, cancellationToken).ConfigureAwait(false);
                if (response.StatusCode is >= 200 and < 400)
                {
                    var responseBody = await response.Raw.Content.ReadAsStringAsync();
                    try
                    {
                        var body = JsonUtils.Deserialize<double>(responseBody)!;
                        return new RawResponse<double>
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

        public async Task<RawResponse<bool>> GetAndReturnBoolAsync(bool request, RequestOptions? options = null, CancellationToken cancellationToken = default) {
            return await _client.Options.ExceptionHandler.TryCatchAsync(async () =>
            {
                var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Post, Path = "/primitive/boolean", Body = request, Options = options}, cancellationToken).ConfigureAwait(false);
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

        public async Task<RawResponse<DateTime>> GetAndReturnDatetimeAsync(DateTime request, RequestOptions? options = null, CancellationToken cancellationToken = default) {
            return await _client.Options.ExceptionHandler.TryCatchAsync(async () =>
            {
                var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Post, Path = "/primitive/datetime", Body = request, Options = options}, cancellationToken).ConfigureAwait(false);
                if (response.StatusCode is >= 200 and < 400)
                {
                    var responseBody = await response.Raw.Content.ReadAsStringAsync();
                    try
                    {
                        var body = JsonUtils.Deserialize<DateTime>(responseBody)!;
                        return new RawResponse<DateTime>
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

        public async Task<RawResponse<DateOnly>> GetAndReturnDateAsync(DateOnly request, RequestOptions? options = null, CancellationToken cancellationToken = default) {
            return await _client.Options.ExceptionHandler.TryCatchAsync(async () =>
            {
                var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Post, Path = "/primitive/date", Body = request, Options = options}, cancellationToken).ConfigureAwait(false);
                if (response.StatusCode is >= 200 and < 400)
                {
                    var responseBody = await response.Raw.Content.ReadAsStringAsync();
                    try
                    {
                        var body = JsonUtils.Deserialize<DateOnly>(responseBody)!;
                        return new RawResponse<DateOnly>
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

        public async Task<RawResponse<string>> GetAndReturnUuidAsync(string request, RequestOptions? options = null, CancellationToken cancellationToken = default) {
            return await _client.Options.ExceptionHandler.TryCatchAsync(async () =>
            {
                var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Post, Path = "/primitive/uuid", Body = request, Options = options}, cancellationToken).ConfigureAwait(false);
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

        public async Task<RawResponse<string>> GetAndReturnBase64Async(string request, RequestOptions? options = null, CancellationToken cancellationToken = default) {
            return await _client.Options.ExceptionHandler.TryCatchAsync(async () =>
            {
                var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Post, Path = "/primitive/base64", Body = request, Options = options}, cancellationToken).ConfigureAwait(false);
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
