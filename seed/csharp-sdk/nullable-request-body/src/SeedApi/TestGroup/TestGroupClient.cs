using System.Text.Json;
using SeedApi.Core;

namespace SeedApi;

public partial class TestGroupClient
{
    private RawClient _client;

    internal TestGroupClient(RawClient client)
    {
        _client = client;
    }

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
}
