using global::System.Text.Json;
using SeedCsharpElidePathParameters.Core;

namespace SeedCsharpElidePathParameters;

public partial class HeadersClient : IHeadersClient
{
    private readonly RawClient _client;

    internal HeadersClient(RawClient client)
    {
        _client = client;
    }

    private async Task<WithRawResponse<User>> GetHeadersPathParamAsyncCore(
        string headerId,
        GetHeadersPathParamRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedCsharpElidePathParameters.Core.HeadersBuilder.Builder()
            .Add("X-Tenant-Id", request.XTenantId)
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
                        "/headers/{0}",
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

    private async Task<WithRawResponse<User>> GetHeadersPathParamBodyAsyncCore(
        string headerId,
        GetHeadersPathParamBodyRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedCsharpElidePathParameters.Core.HeadersBuilder.Builder()
            .Add("X-Tenant-Id", request.XTenantId)
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    Method = HttpMethodExtensions.Patch,
                    Path = string.Format(
                        "/headers/{0}",
                        ValueConvert.ToPathParameterString(headerId)
                    ),
                    Body = request.Body,
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
    /// Endpoint with only path parameters but service-level headers. The wrapper should NOT be elided because it holds the service header field.
    /// </summary>
    /// <example><code>
    /// await client.Headers.GetHeadersPathParamAsync(
    ///     "header_id",
    ///     new GetHeadersPathParamRequest { XTenantId = "X-Tenant-Id" }
    /// );
    /// </code></example>
    public WithRawResponseTask<User> GetHeadersPathParamAsync(
        string headerId,
        GetHeadersPathParamRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<User>(
            GetHeadersPathParamAsyncCore(headerId, request, options, cancellationToken)
        );
    }

    /// <summary>
    /// Endpoint with path parameter + body + service-level headers. The wrapper should NOT be unwrapped because of service headers.
    /// </summary>
    /// <example><code>
    /// await client.Headers.GetHeadersPathParamBodyAsync(
    ///     "header_id",
    ///     new GetHeadersPathParamBodyRequest
    ///     {
    ///         XTenantId = "X-Tenant-Id",
    ///         Body = new User
    ///         {
    ///             Name = "name",
    ///             Tags = new List&lt;string&gt;() { "tags", "tags" },
    ///         },
    ///     }
    /// );
    /// </code></example>
    public WithRawResponseTask<User> GetHeadersPathParamBodyAsync(
        string headerId,
        GetHeadersPathParamBodyRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<User>(
            GetHeadersPathParamBodyAsyncCore(headerId, request, options, cancellationToken)
        );
    }
}
