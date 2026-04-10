using global::System.Text.Json;
using SeedApi.Core;

namespace SeedApi;

public partial class InlinedrequestsClient : IInlinedrequestsClient
{
    private readonly RawClient _client;

    internal InlinedrequestsClient(RawClient client)
    {
        try
        {
            _client = client;
        }
        catch (Exception ex)
        {
            client.Options.ExceptionHandler?.CaptureException(ex);
            throw;
        }
    }

    private async Task<
        WithRawResponse<TypesObjectWithOptionalField>
    > PostwithobjectbodyandresponseAsyncCore(
        InlinedRequestsPostWithObjectBodyandResponseRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
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
                            Path = "req-bodies/object",
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
                        var responseData = JsonUtils.Deserialize<TypesObjectWithOptionalField>(
                            responseBody
                        )!;
                        return new WithRawResponse<TypesObjectWithOptionalField>()
                        {
                            Data = responseData,
                            RawResponse = new RawResponse()
                            {
                                StatusCode = response.Raw.StatusCode,
                                Url =
                                    response.Raw.RequestMessage?.RequestUri
                                    ?? new Uri("about:blank"),
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
                    try
                    {
                        switch (response.StatusCode)
                        {
                            case 400:
                                throw new BadRequestError(
                                    JsonUtils.Deserialize<BadObjectRequestInfo>(responseBody)
                                );
                        }
                    }
                    catch (JsonException)
                    {
                        // unable to map error response, throwing generic error
                    }
                    throw new SeedApiApiException(
                        $"Error with status code {response.StatusCode}",
                        response.StatusCode,
                        responseBody
                    );
                }
            })
            .ConfigureAwait(false);
    }

    /// <summary>
    /// POST with custom object in request body, response is an object
    /// </summary>
    /// <example><code>
    /// await client.Inlinedrequests.PostwithobjectbodyandresponseAsync(
    ///     new InlinedRequestsPostWithObjectBodyandResponseRequest
    ///     {
    ///         String = "string",
    ///         Integer = 1,
    ///         NestedObject = new TypesObjectWithOptionalField(),
    ///     }
    /// );
    /// </code></example>
    public WithRawResponseTask<TypesObjectWithOptionalField> PostwithobjectbodyandresponseAsync(
        InlinedRequestsPostWithObjectBodyandResponseRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<TypesObjectWithOptionalField>(
            PostwithobjectbodyandresponseAsyncCore(request, options, cancellationToken)
        );
    }
}
