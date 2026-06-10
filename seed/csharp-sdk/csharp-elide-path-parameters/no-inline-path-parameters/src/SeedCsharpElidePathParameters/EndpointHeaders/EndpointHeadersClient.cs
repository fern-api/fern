using global::System.Text.Json;
using SeedCsharpElidePathParameters.Core;

namespace SeedCsharpElidePathParameters;

public partial class EndpointHeadersClient : IEndpointHeadersClient
{
    private readonly RawClient _client;

    internal EndpointHeadersClient(RawClient client)
    {
        _client = client;
    }

    private async Task<WithRawResponse<User>> GetEndpointHeadersPathParamAsyncCore(
        string headerId,
        GetEndpointHeadersPathParamRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedCsharpElidePathParameters.Core.HeadersBuilder.Builder()
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
                        "/endpoint-headers/{0}",
                        ValueConvert.ToPathParameterString(headerId)
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
                throw new SeedCsharpElidePathParametersApiException(
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
            throw new SeedCsharpElidePathParametersApiException(
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
    ///     "header_id",
    ///     new GetEndpointHeadersPathParamRequest { XApiVersion = "X-API-Version" }
    /// );
    /// </code></example>
    public WithRawResponseTask<User> GetEndpointHeadersPathParamAsync(
        string headerId,
        GetEndpointHeadersPathParamRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<User>(
            GetEndpointHeadersPathParamAsyncCore(headerId, request, options, cancellationToken)
        );
    }
}
