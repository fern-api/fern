using global::System.Text.Json;
using SeedApi.Core;

namespace SeedApi;

public partial class ReferenceClient : IReferenceClient
{
    private readonly RawClient _client;

    internal ReferenceClient(RawClient client)
    {
        _client = client;
    }

    private async Task<WithRawResponse<SendResponse>> SendAsyncCore(
        SendRequest request,
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
                    Path = "reference",
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
    /// await client.Reference.SendAsync(
    ///     new SendRequest
    ///     {
    ///         Prompt = SendRequestPrompt.YouAreAHelpfulAssistant,
    ///         Query = "query",
    ///         Stream = true,
    ///         Ending = SendRequestEnding.Ending,
    ///         Context = SomeLiteral.YoureSuperWise,
    ///         ContainerObject = new ContainerObject
    ///         {
    ///             NestedObjects = new List&lt;NestedObjectWithLiterals&gt;()
    ///             {
    ///                 new NestedObjectWithLiterals
    ///                 {
    ///                     Literal1 = NestedObjectWithLiteralsLiteral1.Literal1,
    ///                     Literal2 = NestedObjectWithLiteralsLiteral2.Literal2,
    ///                     StrProp = "strProp",
    ///                 },
    ///             },
    ///         },
    ///     }
    /// );
    /// </code></example>
    public WithRawResponseTask<SendResponse> SendAsync(
        SendRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<SendResponse>(
            SendAsyncCore(request, options, cancellationToken)
        );
    }
}
