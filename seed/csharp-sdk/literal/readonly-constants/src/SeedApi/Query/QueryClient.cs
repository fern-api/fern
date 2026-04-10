using global::System.Text.Json;
using SeedApi.Core;

namespace SeedApi;

public partial class QueryClient : IQueryClient
{
    private readonly RawClient _client;

    internal QueryClient(RawClient client)
    {
        _client = client;
    }

    private async Task<WithRawResponse<SendResponse>> SendAsyncCore(
        QuerySendRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _queryString = new SeedApi.Core.QueryStringBuilder.Builder(capacity: 9)
            .Add("prompt", request.Prompt)
            .Add("optional_prompt", request.OptionalPrompt)
            .Add("alias_prompt", request.AliasPrompt)
            .Add("alias_optional_prompt", request.AliasOptionalPrompt)
            .Add("query", request.Query)
            .Add("stream", request.Stream)
            .Add("optional_stream", request.OptionalStream)
            .Add("alias_stream", request.AliasStream)
            .Add("alias_optional_stream", request.AliasOptionalStream)
            .MergeAdditional(options?.AdditionalQueryParameters)
            .Build();
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
                    Path = "query",
                    QueryString = _queryString,
                    Headers = _headers,
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
    /// await client.Query.SendAsync(
    ///     new QuerySendRequest
    ///     {
    ///         Prompt = QuerySendRequestPrompt.YouAreAHelpfulAssistant,
    ///         AliasPrompt = AliasToPrompt.YouAreAHelpfulAssistant,
    ///         Query = "query",
    ///         Stream = true,
    ///         AliasStream = true,
    ///     }
    /// );
    /// </code></example>
    public WithRawResponseTask<SendResponse> SendAsync(
        QuerySendRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<SendResponse>(
            SendAsyncCore(request, options, cancellationToken)
        );
    }
}
