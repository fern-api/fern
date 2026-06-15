using SeedEnum.Core;

namespace SeedEnum;

public partial class HeadersClient : IHeadersClient
{
    private readonly RawClient _client;

    internal HeadersClient(RawClient client)
    {
        _client = client;
    }

    private async Task<RawResponse> SendAsyncCore(
        SendEnumAsHeaderRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedEnum.Core.HeadersBuilder.Builder()
            .Add("operand", request.Operand)
            .Add("maybeOperand", request.MaybeOperand)
            .Add("operandOrColor", request.OperandOrColor)
            .Add("maybeOperandOrColor", request.MaybeOperandOrColor)
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
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
            return new SeedEnum.RawResponse()
            {
                StatusCode = response.Raw.StatusCode,
                Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
            };
        }
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            throw new SeedEnumApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody,
                rawResponse: new SeedEnum.RawResponse()
                {
                    StatusCode = response.Raw.StatusCode,
                    Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                    Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                }
            );
        }
    }

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
    public WithRawResponseTask SendAsync(
        SendEnumAsHeaderRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask(SendAsyncCore(request, options, cancellationToken));
    }
}
