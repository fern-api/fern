using System.Text.Json;
using SeedExhaustive.Core;
using SeedExhaustive.Types;

namespace SeedExhaustive;

public partial class InlinedRequestsClient : IInlinedRequestsClient
{
    private RawClient _client;

    internal InlinedRequestsClient(RawClient client)
    {
        _client = client;
    }

    private async Task<
        WithRawResponse<ObjectWithOptionalField>
    > PostWithObjectBodyandResponseAsyncCore(
        PostWithObjectBody request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedExhaustive.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Post,
                    Path = "/req-bodies/object",
                    Body = request,
                    Headers = _headers,
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
                var responseData = JsonUtils.Deserialize<ObjectWithOptionalField>(responseBody)!;
                return new WithRawResponse<ObjectWithOptionalField>()
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
                throw new SeedExhaustiveApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
            }
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            try
            {
                switch (response.StatusCode)
                {
                    case 400:
                        throw new BadRequestBody(
                            JsonUtils.Deserialize<BadObjectRequestInfo>(responseBody)
                        );
                }
            }
            catch (JsonException)
            {
                // unable to map error response, throwing generic error
            }
            throw new SeedExhaustiveApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <summary>
    /// POST with custom object in request body, response is an object
    /// </summary>
    /// <example><code>
    /// await client.InlinedRequests.PostWithObjectBodyandResponseAsync(
    ///     new PostWithObjectBody
    ///     {
    ///         String = "string",
    ///         Integer = 1,
    ///         NestedObject = new ObjectWithOptionalField
    ///         {
    ///             String = "string",
    ///             Integer = 1,
    ///             Long = 1000000,
    ///             Double = 1.1,
    ///             Bool = true,
    ///             Datetime = new DateTime(2024, 01, 15, 09, 30, 00, 000),
    ///             Date = new DateOnly(2023, 1, 15),
    ///             Uuid = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    ///             Base64 = "SGVsbG8gd29ybGQh",
    ///             List = new List&lt;string&gt;() { "list", "list" },
    ///             Set = new HashSet&lt;string&gt;() { "set" },
    ///             Map = new Dictionary&lt;int, string&gt;() { { 1, "map" } },
    ///             Bigint = "1000000",
    ///         },
    ///     }
    /// );
    /// </code></example>
    public WithRawResponseTask<ObjectWithOptionalField> PostWithObjectBodyandResponseAsync(
        PostWithObjectBody request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<ObjectWithOptionalField>(
            PostWithObjectBodyandResponseAsyncCore(request, options, cancellationToken)
        );
    }
}
