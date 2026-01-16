using SeedEnum.Core;

namespace SeedEnum;

public partial class HeadersClient : IHeadersClient
{
    private RawClient _client;

    internal HeadersClient (RawClient client){
        _client = client;
        Raw = new RawAccessClient(_client);
    }

    public HeadersClient.RawAccessClient Raw { get; }

    /// <example><code>
    /// await client.Headers.SendAsync(
    ///     new SendEnumAsHeaderRequest
    ///     {
    ///         Operand = Operand.GreaterThan,
    ///         MaybeOperand = Operand.GreaterThan,
    ///         OperandOrColor = Color.Red,
    ///         MaybeOperandOrColor = null,
    ///     }
    /// );
    /// </code></example>
    public async Task SendAsync(SendEnumAsHeaderRequest request, RequestOptions? options = null, CancellationToken cancellationToken = default) {
        var _headers = new Headers(new Dictionary<string, string>(){
                { "operand", request.Operand.Stringify() },
                { "operandOrColor", JsonUtils.Serialize(request.OperandOrColor) },
            }
        );
        if (request.MaybeOperand != null){
            _headers["maybeOperand"] = request.MaybeOperand.Value.Stringify();
        }
        if (request.MaybeOperandOrColor != null){
            _headers["maybeOperandOrColor"] = JsonUtils.Serialize(request.MaybeOperandOrColor);
        }
        var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Post, Path = "headers", Headers = _headers, Options = options}, cancellationToken).ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedEnumApiException($"Error with status code {response.StatusCode}", response.StatusCode, responseBody);
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

        public async Task<RawResponse<object>> SendAsync(SendEnumAsHeaderRequest request, RequestOptions? options = null, CancellationToken cancellationToken = default) {
            var _headers = new Headers(new Dictionary<string, string>(){
                    { "operand", request.Operand.Stringify() },
                    { "operandOrColor", JsonUtils.Serialize(request.OperandOrColor) },
                }
            );
            if (request.MaybeOperand != null){
                _headers["maybeOperand"] = request.MaybeOperand.Value.Stringify();
            }
            if (request.MaybeOperandOrColor != null){
                _headers["maybeOperandOrColor"] = JsonUtils.Serialize(request.MaybeOperandOrColor);
            }
            var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Post, Path = "headers", Headers = _headers, Options = options}, cancellationToken).ConfigureAwait(false);
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
                throw new SeedEnumApiException($"Error with status code {response.StatusCode}", response.StatusCode, responseBody);
            }
        }

    }

}
