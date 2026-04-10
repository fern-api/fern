using global::System.Text.Json;
using SeedApi.Core;

namespace SeedApi;

public partial class InlinedClient : IInlinedClient
{
    private readonly RawClient _client;

    internal InlinedClient(RawClient client)
    {
        _client = client;
    }

    private async Task<WithRawResponse<SendResponse>> SendAsyncCore(
        InlinedSendRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedApi.Core.HeadersBuilder.Builder()
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
                    ContentType = "application/json",
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            try
            {
                var responseData = JsonUtils.Deserialize<SendResponse>(responseBody)!;
                return new WithRawResponse<SendResponse>()
                {
                    Data = responseData,
                    RawResponse = new RawResponse()
                    {
                        StatusCode = response.Raw.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                        Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                    },
                };
            }
            catch (JsonException e)
            {
                throw new SeedApiApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
            }
        }
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            throw new SeedApiApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <example><code>
    /// await client.Inlined.SendAsync(
    ///     new InlinedSendRequest
    ///     {
    ///         Prompt = InlinedSendRequestPrompt.YouAreAHelpfulAssistant,
    ///         Query = "query",
    ///         Stream = true,
    ///         AliasedContext = SomeAliasedLiteral.YoureSuperWise,
    ///         ObjectWithLiteral = new ATopLevelLiteral
    ///         {
    ///             NestedLiteral = new ANestedLiteral { MyLiteral = ANestedLiteralMyLiteral.HowSuperCool },
    ///         },
    ///     }
    /// );
    /// </code></example>
    public WithRawResponseTask<SendResponse> SendAsync(
        InlinedSendRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<SendResponse>(
            SendAsyncCore(request, options, cancellationToken)
        );
    }
}
