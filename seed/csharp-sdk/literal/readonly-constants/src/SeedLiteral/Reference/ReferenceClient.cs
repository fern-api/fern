using SeedLiteral.Core;
using System.Text.Json;

namespace SeedLiteral;

public partial class ReferenceClient : IReferenceClient
{
    private RawClient _client;

    internal ReferenceClient (RawClient client){
        _client = client;
        Raw = new RawAccessClient(_client);
    }

    public ReferenceClient.RawAccessClient Raw { get; }

    /// <example><code>
    /// await client.Reference.SendAsync(
    ///     new SendRequest
    ///     {
    ///         Prompt = "You are a helpful assistant",
    ///         Stream = false,
    ///         Context = "You're super wise",
    ///         Query = "What is the weather today",
    ///         ContainerObject = new ContainerObject
    ///         {
    ///             NestedObjects = new List&lt;NestedObjectWithLiterals&gt;()
    ///             {
    ///                 new NestedObjectWithLiterals
    ///                 {
    ///                     Literal1 = "literal1",
    ///                     Literal2 = "literal2",
    ///                     StrProp = "strProp",
    ///                 },
    ///             },
    ///         },
    ///     }
    /// );
    /// </code></example>
    public async Task<SendResponse> SendAsync(SendRequest request, RequestOptions? options = null, CancellationToken cancellationToken = default) {
        var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Post, Path = "reference", Body = request, Options = options}, cancellationToken).ConfigureAwait(false);
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

        public async Task<RawResponse<SendResponse>> SendAsync(SendRequest request, RequestOptions? options = null, CancellationToken cancellationToken = default) {
            var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Post, Path = "reference", Body = request, Options = options}, cancellationToken).ConfigureAwait(false);
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
