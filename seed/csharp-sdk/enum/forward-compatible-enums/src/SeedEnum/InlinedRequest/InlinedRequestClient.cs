using SeedEnum.Core;

namespace SeedEnum;

public partial class InlinedRequestClient : IInlinedRequestClient
{
    private readonly RawClient _client;

    internal InlinedRequestClient(RawClient client)
    {
        _client = client;
    }

    private async Task<RawResponse> SendAsyncCore(
        SendEnumInlinedRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedEnum.Core.HeadersBuilder.Builder()
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
                    Path = "inlined",
                    Body = request,
                    Headers = _headers,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            return new RawResponse()
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
                responseBody
            );
        }
    }

    /// <example><code>
    /// await client.InlinedRequest.SendAsync(
    ///     new SendEnumInlinedRequest { Operand = Operand.GreaterThan, OperandOrColor = Color.Red }
    /// );
    /// </code></example>
    public WithRawResponseTask SendAsync(
        SendEnumInlinedRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask(SendAsyncCore(request, options, cancellationToken));
    }
}
