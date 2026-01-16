using SeedLiteral.Core;
using System.Text.Json;

namespace SeedLiteral;

public partial class InlinedClient : IInlinedClient
{
    private RawClient _client;

    internal InlinedClient (RawClient client){
        _client = client;
        Raw = new RawAccessClient(_client);
    }

    public InlinedClient.RawAccessClient Raw { get; }

    /// <example><code>
    /// await client.Inlined.SendAsync(
    ///     new SendLiteralsInlinedRequest
    ///     {
    ///         Temperature = 10.1,
    ///         Prompt = "You are a helpful assistant",
    ///         Context = "You're super wise",
    ///         AliasedContext = "You're super wise",
    ///         MaybeContext = "You're super wise",
    ///         ObjectWithLiteral = new ATopLevelLiteral
    ///         {
    ///             NestedLiteral = new ANestedLiteral { MyLiteral = "How super cool" },
    ///         },
    ///         Stream = false,
    ///         Query = "What is the weather today",
    ///     }
    /// );
    /// </code></example>
    public async Task<SendResponse> SendAsync(SendLiteralsInlinedRequest request, RequestOptions? options = null, CancellationToken cancellationToken = default) {
        var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Post, Path = "inlined", Body = request, Options = options}, cancellationToken).ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            try
            {
                return JsonUtils.Deserialize<SendResponse>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedLiteralException("Failed to deserialize response", e);
            }
        }
        
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedLiteralApiException($"Error with status code {response.StatusCode}", response.StatusCode, responseBody);
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

        public async Task<RawResponse<SendResponse>> SendAsync(SendLiteralsInlinedRequest request, RequestOptions? options = null, CancellationToken cancellationToken = default) {
            var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Post, Path = "inlined", Body = request, Options = options}, cancellationToken).ConfigureAwait(false);
            if (response.StatusCode is >= 200 and < 400)
            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                try
                {
                    var body = JsonUtils.Deserialize<SendResponse>(responseBody)!;
                    return new RawResponse<SendResponse>
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
                    throw new SeedLiteralException("Failed to deserialize response", e);
                }
            }
            
            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                throw new SeedLiteralApiException($"Error with status code {response.StatusCode}", response.StatusCode, responseBody);
            }
        }

    }

}
