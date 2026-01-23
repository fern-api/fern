using System.Text.Json;
using SeedLiteral.Core;

namespace SeedLiteral;

public partial class QueryClient : IQueryClient
{
    private RawClient _client;

    internal QueryClient(RawClient client)
    {
        _client = client;
    }

    private async Task<WithRawResponse<SendResponse>> SendAsyncCore(
        SendLiteralsInQueryRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _queryBuilder = new SeedLiteral.Core.QueryStringBuilder.Builder(capacity: 9)
            .Add("prompt", request.Prompt)
            .AddDeepObject("alias_prompt", request.AliasPrompt)
            .Add("query", request.Query)
            .Add("stream", request.Stream)
            .AddDeepObject("alias_stream", request.AliasStream);
        if (request.OptionalPrompt != null)
        {
            _queryBuilder.Add("optional_prompt", request.OptionalPrompt);
        }
        if (request.AliasOptionalPrompt != null)
        {
            _queryBuilder.AddDeepObject("alias_optional_prompt", request.AliasOptionalPrompt);
        }
        if (request.OptionalStream != null)
        {
            _queryBuilder.Add("optional_stream", request.OptionalStream);
        }
        if (request.AliasOptionalStream != null)
        {
            _queryBuilder.AddDeepObject("alias_optional_stream", request.AliasOptionalStream);
        }
        var _queryString = _queryBuilder
            .MergeAdditional(options?.AdditionalQueryParameters)
            .Build();
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Post,
                    Path = "query",
                    QueryString = _queryString,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
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
                throw new SeedLiteralApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
            }
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedLiteralApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <example><code>
    /// await client.Query.SendAsync(
    ///     new SendLiteralsInQueryRequest
    ///     {
    ///         Prompt = "You are a helpful assistant",
    ///         OptionalPrompt = "You are a helpful assistant",
    ///         AliasPrompt = "You are a helpful assistant",
    ///         AliasOptionalPrompt = "You are a helpful assistant",
    ///         Stream = false,
    ///         OptionalStream = false,
    ///         AliasStream = false,
    ///         AliasOptionalStream = false,
    ///         Query = "What is the weather today",
    ///     }
    /// );
    /// </code></example>
    public WithRawResponseTask<SendResponse> SendAsync(
        SendLiteralsInQueryRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<SendResponse>(
            SendAsyncCore(request, options, cancellationToken)
        );
    }
}
