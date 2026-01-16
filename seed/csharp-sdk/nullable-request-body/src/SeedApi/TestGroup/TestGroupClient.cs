using System.Text.Json;
using SeedApi.Core;

namespace SeedApi;

public partial class TestGroupClient : ITestGroupClient
{
    private RawClient _client;

    internal TestGroupClient(RawClient client)
    {
        _client = client;
        Raw = new RawAccessClient(_client);
    }

    public TestGroupClient.RawAccessClient Raw { get; }

    /// <summary>
    /// Post a nullable request body
    /// </summary>
    /// <example><code>
    /// await client.TestGroup.TestMethodNameAsync(
    ///     new TestMethodNameTestGroupRequest { PathParam = "path_param", Body = new PlainObject() }
    /// );
    /// </code></example>
    public async Task<object> TestMethodNameAsync(
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
                return JsonUtils.Deserialize<object>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedApiException("Failed to deserialize response", e);
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

    public partial class RawAccessClient
    {
        private readonly RawClient _client;

        internal RawAccessClient(RawClient client)
        {
            _client = client;
        }

        private static IReadOnlyDictionary<string, IEnumerable<string>> ExtractHeaders(
            HttpResponseMessage response
        )
        {
            var headers = new Dictionary<string, IEnumerable<string>>(
                StringComparer.OrdinalIgnoreCase
            );
            foreach (var header in response.Headers)
            {
                headers[header.Key] = header.Value.ToList();
            }
            if (response.Content != null)
            {
                foreach (var header in response.Content.Headers)
                {
                    headers[header.Key] = header.Value.ToList();
                }
            }
            return headers;
        }

        /// <summary>
        /// Post a nullable request body
        /// </summary>
        public async Task<WithRawResponse<object>> TestMethodNameAsync(
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
                    var data = JsonUtils.Deserialize<object>(responseBody)!;
                    return new WithRawResponse<object>
                    {
                        Data = data,
                        RawResponse = new RawResponse
                        {
                            StatusCode = (global::System.Net.HttpStatusCode)response.StatusCode,
                            Url = response.Raw.RequestMessage?.RequestUri!,
                            Headers = new ResponseHeaders(ExtractHeaders(response.Raw)),
                        },
                    };
                }
                catch (JsonException e)
                {
                    throw new SeedApiException("Failed to deserialize response", e);
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
    }
}
