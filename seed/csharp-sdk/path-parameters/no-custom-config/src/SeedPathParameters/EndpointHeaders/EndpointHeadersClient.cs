using global::System.Text.Json;
using SeedPathParameters.Core;

namespace SeedPathParameters;

public partial class EndpointHeadersClient : IEndpointHeadersClient
{
    private readonly RawClient _client;

    internal EndpointHeadersClient(RawClient client)
    {
        _client = client;
    }

    private async Task<WithRawResponse<User>> GetEndpointHeadersPathParamAsyncCore(
        GetEndpointHeadersPathParamRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedPathParameters.Core.HeadersBuilder.Builder()
            .Add("X-API-Version", request.XApiVersion)
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    Method = HttpMethod.Get,
                    Path = string.Format(
                        "/{0}/endpoint-headers/{1}",
                        ValueConvert.ToPathParameterString(request.TenantId),
                        ValueConvert.ToPathParameterString(request.HeaderId)
                    ),
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
                var responseData = JsonUtils.Deserialize<User>(responseBody)!;
                return new WithRawResponse<User>()
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
                throw new SeedPathParametersApiException(
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
            throw new SeedPathParametersApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <summary>
    /// Endpoint with only path parameters and endpoint-level headers but NO service-level headers. The wrapper should NOT be elided because it holds the endpoint header field.
    /// </summary>
    /// <example><code>
    /// await client.EndpointHeaders.GetEndpointHeadersPathParamAsync(
    ///     new GetEndpointHeadersPathParamRequest
    ///     {
    ///         TenantId = "tenant_id",
    ///         HeaderId = "header_id",
    ///         XApiVersion = "X-API-Version",
    ///     }
    /// );
    /// </code></example>
    public WithRawResponseTask<User> GetEndpointHeadersPathParamAsync(
        GetEndpointHeadersPathParamRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<User>(
            GetEndpointHeadersPathParamAsyncCore(request, options, cancellationToken)
        );
    }
}
