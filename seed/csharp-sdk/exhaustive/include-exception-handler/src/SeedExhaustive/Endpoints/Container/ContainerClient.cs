using SeedExhaustive.Core;
using SeedExhaustive;
using System.Text.Json;
using SeedExhaustive.Types;

namespace SeedExhaustive.Endpoints;

public partial class ContainerClient : IContainerClient
{
    private RawClient _client;

    internal ContainerClient (RawClient client){
        try{
            _client = client;
            Raw = new RawAccessClient(_client);
        }
        catch (Exception ex){
            client.Options.ExceptionHandler?.CaptureException(ex);
            throw;
        }
    }

    public ContainerClient.RawAccessClient Raw { get; }

    /// <example><code>
    /// await client.Endpoints.Container.GetAndReturnListOfPrimitivesAsync(
    ///     new List&lt;string&gt;() { "string", "string" }
    /// );
    /// </code></example>
    public async Task<IEnumerable<string>> GetAndReturnListOfPrimitivesAsync(IEnumerable<string> request, RequestOptions? options = null, CancellationToken cancellationToken = default) {
        return await _client.Options.ExceptionHandler.TryCatchAsync(async () =>
        {
            var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Post, Path = "/container/list-of-primitives", Body = request, Options = options}, cancellationToken).ConfigureAwait(false);
            if (response.StatusCode is >= 200 and < 400)
            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                try
                {
                    return JsonUtils.Deserialize<IEnumerable<string>>(responseBody)!;
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
    /// await client.Endpoints.Container.GetAndReturnListOfObjectsAsync(
    ///     new List&lt;ObjectWithRequiredField&gt;()
    ///     {
    ///         new ObjectWithRequiredField { String = "string" },
    ///         new ObjectWithRequiredField { String = "string" },
    ///     }
    /// );
    /// </code></example>
    public async Task<IEnumerable<ObjectWithRequiredField>> GetAndReturnListOfObjectsAsync(IEnumerable<ObjectWithRequiredField> request, RequestOptions? options = null, CancellationToken cancellationToken = default) {
        return await _client.Options.ExceptionHandler.TryCatchAsync(async () =>
        {
            var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Post, Path = "/container/list-of-objects", Body = request, Options = options}, cancellationToken).ConfigureAwait(false);
            if (response.StatusCode is >= 200 and < 400)
            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                try
                {
                    return JsonUtils.Deserialize<IEnumerable<ObjectWithRequiredField>>(responseBody)!;
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
    /// await client.Endpoints.Container.GetAndReturnSetOfPrimitivesAsync(
    ///     new HashSet&lt;string&gt;() { "string" }
    /// );
    /// </code></example>
    public async Task<HashSet<string>> GetAndReturnSetOfPrimitivesAsync(HashSet<string> request, RequestOptions? options = null, CancellationToken cancellationToken = default) {
        return await _client.Options.ExceptionHandler.TryCatchAsync(async () =>
        {
            var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Post, Path = "/container/set-of-primitives", Body = request, Options = options}, cancellationToken).ConfigureAwait(false);
            if (response.StatusCode is >= 200 and < 400)
            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                try
                {
                    return JsonUtils.Deserialize<HashSet<string>>(responseBody)!;
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
    /// await client.Endpoints.Container.GetAndReturnSetOfObjectsAsync(
    ///     new HashSet&lt;ObjectWithRequiredField&gt;() { new ObjectWithRequiredField { String = "string" } }
    /// );
    /// </code></example>
    public async Task<HashSet<ObjectWithRequiredField>> GetAndReturnSetOfObjectsAsync(HashSet<ObjectWithRequiredField> request, RequestOptions? options = null, CancellationToken cancellationToken = default) {
        return await _client.Options.ExceptionHandler.TryCatchAsync(async () =>
        {
            var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Post, Path = "/container/set-of-objects", Body = request, Options = options}, cancellationToken).ConfigureAwait(false);
            if (response.StatusCode is >= 200 and < 400)
            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                try
                {
                    return JsonUtils.Deserialize<HashSet<ObjectWithRequiredField>>(responseBody)!;
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
    /// await client.Endpoints.Container.GetAndReturnMapPrimToPrimAsync(
    ///     new Dictionary&lt;string, string&gt;() { { "string", "string" } }
    /// );
    /// </code></example>
    public async Task<Dictionary<string, string>> GetAndReturnMapPrimToPrimAsync(Dictionary<string, string> request, RequestOptions? options = null, CancellationToken cancellationToken = default) {
        return await _client.Options.ExceptionHandler.TryCatchAsync(async () =>
        {
            var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Post, Path = "/container/map-prim-to-prim", Body = request, Options = options}, cancellationToken).ConfigureAwait(false);
            if (response.StatusCode is >= 200 and < 400)
            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                try
                {
                    return JsonUtils.Deserialize<Dictionary<string, string>>(responseBody)!;
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
    /// await client.Endpoints.Container.GetAndReturnMapOfPrimToObjectAsync(
    ///     new Dictionary&lt;string, ObjectWithRequiredField&gt;()
    ///     {
    ///         {
    ///             "string",
    ///             new ObjectWithRequiredField { String = "string" }
    ///         },
    ///     }
    /// );
    /// </code></example>
    public async Task<Dictionary<string, ObjectWithRequiredField>> GetAndReturnMapOfPrimToObjectAsync(Dictionary<string, ObjectWithRequiredField> request, RequestOptions? options = null, CancellationToken cancellationToken = default) {
        return await _client.Options.ExceptionHandler.TryCatchAsync(async () =>
        {
            var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Post, Path = "/container/map-prim-to-object", Body = request, Options = options}, cancellationToken).ConfigureAwait(false);
            if (response.StatusCode is >= 200 and < 400)
            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                try
                {
                    return JsonUtils.Deserialize<Dictionary<string, ObjectWithRequiredField>>(responseBody)!;
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
    /// await client.Endpoints.Container.GetAndReturnOptionalAsync(
    ///     new ObjectWithRequiredField { String = "string" }
    /// );
    /// </code></example>
    public async Task<ObjectWithRequiredField?> GetAndReturnOptionalAsync(ObjectWithRequiredField? request, RequestOptions? options = null, CancellationToken cancellationToken = default) {
        return await _client.Options.ExceptionHandler.TryCatchAsync(async () =>
        {
            var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Post, Path = "/container/opt-objects", Body = request, Options = options}, cancellationToken).ConfigureAwait(false);
            if (response.StatusCode is >= 200 and < 400)
            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                try
                {
                    return JsonUtils.Deserialize<ObjectWithRequiredField?>(responseBody)!;
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

        public async Task<RawResponse<IEnumerable<string>>> GetAndReturnListOfPrimitivesAsync(IEnumerable<string> request, RequestOptions? options = null, CancellationToken cancellationToken = default) {
            return await _client.Options.ExceptionHandler.TryCatchAsync(async () =>
            {
                var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Post, Path = "/container/list-of-primitives", Body = request, Options = options}, cancellationToken).ConfigureAwait(false);
                if (response.StatusCode is >= 200 and < 400)
                {
                    var responseBody = await response.Raw.Content.ReadAsStringAsync();
                    try
                    {
                        var body = JsonUtils.Deserialize<IEnumerable<string>>(responseBody)!;
                        return new RawResponse<IEnumerable<string>>
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

        public async Task<RawResponse<IEnumerable<ObjectWithRequiredField>>> GetAndReturnListOfObjectsAsync(IEnumerable<ObjectWithRequiredField> request, RequestOptions? options = null, CancellationToken cancellationToken = default) {
            return await _client.Options.ExceptionHandler.TryCatchAsync(async () =>
            {
                var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Post, Path = "/container/list-of-objects", Body = request, Options = options}, cancellationToken).ConfigureAwait(false);
                if (response.StatusCode is >= 200 and < 400)
                {
                    var responseBody = await response.Raw.Content.ReadAsStringAsync();
                    try
                    {
                        var body = JsonUtils.Deserialize<IEnumerable<ObjectWithRequiredField>>(responseBody)!;
                        return new RawResponse<IEnumerable<ObjectWithRequiredField>>
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

        public async Task<RawResponse<HashSet<string>>> GetAndReturnSetOfPrimitivesAsync(HashSet<string> request, RequestOptions? options = null, CancellationToken cancellationToken = default) {
            return await _client.Options.ExceptionHandler.TryCatchAsync(async () =>
            {
                var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Post, Path = "/container/set-of-primitives", Body = request, Options = options}, cancellationToken).ConfigureAwait(false);
                if (response.StatusCode is >= 200 and < 400)
                {
                    var responseBody = await response.Raw.Content.ReadAsStringAsync();
                    try
                    {
                        var body = JsonUtils.Deserialize<HashSet<string>>(responseBody)!;
                        return new RawResponse<HashSet<string>>
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

        public async Task<RawResponse<HashSet<ObjectWithRequiredField>>> GetAndReturnSetOfObjectsAsync(HashSet<ObjectWithRequiredField> request, RequestOptions? options = null, CancellationToken cancellationToken = default) {
            return await _client.Options.ExceptionHandler.TryCatchAsync(async () =>
            {
                var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Post, Path = "/container/set-of-objects", Body = request, Options = options}, cancellationToken).ConfigureAwait(false);
                if (response.StatusCode is >= 200 and < 400)
                {
                    var responseBody = await response.Raw.Content.ReadAsStringAsync();
                    try
                    {
                        var body = JsonUtils.Deserialize<HashSet<ObjectWithRequiredField>>(responseBody)!;
                        return new RawResponse<HashSet<ObjectWithRequiredField>>
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

        public async Task<RawResponse<Dictionary<string, string>>> GetAndReturnMapPrimToPrimAsync(Dictionary<string, string> request, RequestOptions? options = null, CancellationToken cancellationToken = default) {
            return await _client.Options.ExceptionHandler.TryCatchAsync(async () =>
            {
                var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Post, Path = "/container/map-prim-to-prim", Body = request, Options = options}, cancellationToken).ConfigureAwait(false);
                if (response.StatusCode is >= 200 and < 400)
                {
                    var responseBody = await response.Raw.Content.ReadAsStringAsync();
                    try
                    {
                        var body = JsonUtils.Deserialize<Dictionary<string, string>>(responseBody)!;
                        return new RawResponse<Dictionary<string, string>>
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

        public async Task<RawResponse<Dictionary<string, ObjectWithRequiredField>>> GetAndReturnMapOfPrimToObjectAsync(Dictionary<string, ObjectWithRequiredField> request, RequestOptions? options = null, CancellationToken cancellationToken = default) {
            return await _client.Options.ExceptionHandler.TryCatchAsync(async () =>
            {
                var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Post, Path = "/container/map-prim-to-object", Body = request, Options = options}, cancellationToken).ConfigureAwait(false);
                if (response.StatusCode is >= 200 and < 400)
                {
                    var responseBody = await response.Raw.Content.ReadAsStringAsync();
                    try
                    {
                        var body = JsonUtils.Deserialize<Dictionary<string, ObjectWithRequiredField>>(responseBody)!;
                        return new RawResponse<Dictionary<string, ObjectWithRequiredField>>
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

        public async Task<RawResponse<ObjectWithRequiredField?>> GetAndReturnOptionalAsync(ObjectWithRequiredField? request, RequestOptions? options = null, CancellationToken cancellationToken = default) {
            return await _client.Options.ExceptionHandler.TryCatchAsync(async () =>
            {
                var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Post, Path = "/container/opt-objects", Body = request, Options = options}, cancellationToken).ConfigureAwait(false);
                if (response.StatusCode is >= 200 and < 400)
                {
                    var responseBody = await response.Raw.Content.ReadAsStringAsync();
                    try
                    {
                        var body = JsonUtils.Deserialize<ObjectWithRequiredField?>(responseBody)!;
                        return new RawResponse<ObjectWithRequiredField?>
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
