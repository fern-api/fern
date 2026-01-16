using SeedEnum.Core;

namespace SeedEnum;

public partial class HeadersClient : IHeadersClient
{
    private RawClient _client;

    internal HeadersClient(RawClient client)
    {
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
    public async Task SendAsync(
        SendEnumAsHeaderRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        await Raw.SendAsync(request, options, cancellationToken);
    }

    public partial class RawAccessClient
    {
        private readonly RawClient _client;

        internal RawAccessClient(RawClient client)
        {
            _client = client;
        }

        public async Task<WithRawResponse<object>> SendAsync(
            SendEnumAsHeaderRequest request,
            RequestOptions? options = null,
            CancellationToken cancellationToken = default
        )
        {
            var _headers = new Headers(
                new Dictionary<string, string>()
                {
                    { "operand", request.Operand.Stringify() },
                    { "operandOrColor", JsonUtils.Serialize(request.OperandOrColor) },
                }
            );
            if (request.MaybeOperand != null)
            {
                _headers["maybeOperand"] = request.MaybeOperand.Value.Stringify();
            }
            if (request.MaybeOperandOrColor != null)
            {
                _headers["maybeOperandOrColor"] = JsonUtils.Serialize(request.MaybeOperandOrColor);
            }
            var response = await _client
                .SendRequestAsync(
                    new JsonRequest
                    {
                        BaseUrl = _client.Options.BaseUrl,
                        Method = HttpMethod.Post,
                        Path = "headers",
                        Headers = _headers,
                        Options = options,
                    },
                    cancellationToken
                )
                .ConfigureAwait(false);
            if (response.StatusCode is >= 200 and < 400)
            {
                return new WithRawResponse<object>
                {
                    Data = new object(),
                    RawResponse = new RawResponse
                    {
                        StatusCode = (global::System.Net.HttpStatusCode)response.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri!,
                        Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                    },
                };
            }
            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                throw new SeedEnumApiException(
                    $"Error with status code {response.StatusCode}",
                    response.StatusCode,
                    responseBody
                );
            }
        }
    }
}
