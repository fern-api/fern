using System.Text.Json;
using SeedApi.Core;

namespace SeedApi;

public partial class TestGroupClient : ITestGroupClient
{
    private RawClient _client;

    internal TestGroupClient(RawClient client)
    {
        _client = client;
    }

    private async Task<WithRawResponse<object>> TestMethodNameAsyncCore(
        TestMethodNameTestGroupRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _query = new Dictionary<string, object>();
        if (request.QueryParamObject != null)
        {
            _query["query_param_object"] = JsonUtils.Serialize(request.QueryParamObject);
        }
        if (request.QueryParamInteger != null)
        {
            _query["query_param_integer"] = request.QueryParamInteger.Value.ToString();
        }
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Post,
                    Path = string.Format(
                        "optional-request-body/{0}",
                        ValueConvert.ToPathParameterString(request.PathParam)
                    ),
                    Body = request.Body,
                    Query = _query,
                    ContentType = "application/json",
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
                var responseData = JsonUtils.Deserialize<object>(responseBody)!;
                return new WithRawResponse<object>()
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
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            try
            {
                switch (response.StatusCode)
                {
                    case 422:
                        throw new UnprocessableEntityError(
                            JsonUtils.Deserialize<PlainObject>(responseBody)
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
    }

    /// <summary>
    /// Post a nullable request body
    /// </summary>
    /// <example><code>
    /// await client.TestGroup.TestMethodNameAsync(
    ///     new TestMethodNameTestGroupRequest { PathParam = "path_param", Body = new PlainObject() }
    /// );
    /// </code></example>
    public WithRawResponseTask<object> TestMethodNameAsync(
        TestMethodNameTestGroupRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<object>(
            TestMethodNameAsyncCore(request, options, cancellationToken)
        );
    }
}
