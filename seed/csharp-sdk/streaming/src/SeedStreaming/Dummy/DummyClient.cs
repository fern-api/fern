using SeedStreaming.Core;
using System.Text.Json;

namespace SeedStreaming;

public partial class DummyClient : IDummyClient
{
    private RawClient _client;

    internal DummyClient (RawClient client){
        _client = client;
        Raw = new RawAccessClient(_client);
    }

    public DummyClient.RawAccessClient Raw { get; }

    /// <example><code>
    /// client.Dummy.GenerateStreamAsync(new GenerateStreamRequest { Stream = true, NumEvents = 1 });
    /// </code></example>
    public async IAsyncEnumerable<StreamResponse> GenerateStreamAsync(GenerateStreamRequest request, RequestOptions? options = null, CancellationToken cancellationToken = default) {
        var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Post, Path = "generate-stream", Body = request, Options = options}, cancellationToken).ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            string? line;
            using var reader = new StreamReader(await response.Raw.Content.ReadAsStreamAsync());
            while (!string.IsNullOrEmpty(line = await reader.ReadLineAsync()))
            {
                StreamResponse?result;
                try
                {
                    result = JsonUtils.Deserialize<StreamResponse>(line);
                }
                catch (System.Text.Json.JsonException)
                {
                    throw new SeedStreamingException($"Unable to deserialize JSON response 'line'");
                }
            }
            yield break;
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedStreamingApiException($"Error with status code {response.StatusCode}", response.StatusCode, responseBody);
        }
    }

    /// <example><code>
    /// await client.Dummy.GenerateAsync(new Generateequest { Stream = false, NumEvents = 5 });
    /// </code></example>
    public async Task<StreamResponse> GenerateAsync(Generateequest request, RequestOptions? options = null, CancellationToken cancellationToken = default) {
        var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Post, Path = "generate", Body = request, Options = options}, cancellationToken).ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            try
            {
                return JsonUtils.Deserialize<StreamResponse>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedStreamingException("Failed to deserialize response", e);
            }
        }
        
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedStreamingApiException($"Error with status code {response.StatusCode}", response.StatusCode, responseBody);
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

        public async Task<RawResponse<IAsyncEnumerable<StreamResponse>>> GenerateStreamAsync(GenerateStreamRequest request, RequestOptions? options = null, CancellationToken cancellationToken = default) {
            var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Post, Path = "generate-stream", Body = request, Options = options}, cancellationToken).ConfigureAwait(false);
            // Streaming responses are not supported for raw access
            throw new SeedStreamingException("Streaming responses are not supported for raw access");
            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                throw new SeedStreamingApiException($"Error with status code {response.StatusCode}", response.StatusCode, responseBody);
            }
        }

        public async Task<RawResponse<StreamResponse>> GenerateAsync(Generateequest request, RequestOptions? options = null, CancellationToken cancellationToken = default) {
            var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Post, Path = "generate", Body = request, Options = options}, cancellationToken).ConfigureAwait(false);
            if (response.StatusCode is >= 200 and < 400)
            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                try
                {
                    var body = JsonUtils.Deserialize<StreamResponse>(responseBody)!;
                    return new RawResponse<StreamResponse>
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
                    throw new SeedStreamingException("Failed to deserialize response", e);
                }
            }
            
            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                throw new SeedStreamingApiException($"Error with status code {response.StatusCode}", response.StatusCode, responseBody);
            }
        }

    }

}
