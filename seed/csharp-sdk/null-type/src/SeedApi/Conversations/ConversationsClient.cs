using global::System.Text.Json;
using SeedApi.Core;

namespace SeedApi;

public partial class ConversationsClient : IConversationsClient
{
    private readonly RawClient _client;

    internal ConversationsClient(RawClient client)
    {
        _client = client;
    }

    private async Task<WithRawResponse<OutboundCallConversationsResponse>> OutboundCallAsyncCore(
        OutboundCallConversationsRequest request,
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
                    Path = "conversations/outbound-call",
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
                var responseData = JsonUtils.Deserialize<OutboundCallConversationsResponse>(
                    responseBody
                )!;
                return new WithRawResponse<OutboundCallConversationsResponse>()
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

    /// <summary>
    /// Place an outbound call or validate call setup with dry_run.
    /// </summary>
    /// <example><code>
    /// await client.Conversations.OutboundCallAsync(
    ///     new OutboundCallConversationsRequest { ToPhoneNumber = "to_phone_number" }
    /// );
    /// </code></example>
    public WithRawResponseTask<OutboundCallConversationsResponse> OutboundCallAsync(
        OutboundCallConversationsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<OutboundCallConversationsResponse>(
            OutboundCallAsyncCore(request, options, cancellationToken)
        );
    }
}
