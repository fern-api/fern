using global::System.Text.Json;
using SeedApi.Core;

namespace SeedApi;

public partial class OrganizationsClient : IOrganizationsClient
{
    private readonly RawClient _client;

    internal OrganizationsClient(RawClient client)
    {
        _client = client;
    }

    private async Task<WithRawResponse<Organization>> GetorganizationAsyncCore(
        OrganizationsGetOrganizationRequest request,
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
                    Method = HttpMethod.Get,
                    Path = string.Format(
                        "{0}/organizations/{1}/",
                        ValueConvert.ToPathParameterString(request.TenantId),
                        ValueConvert.ToPathParameterString(request.OrganizationId)
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
                var responseData = JsonUtils.Deserialize<Organization>(responseBody)!;
                return new WithRawResponse<Organization>()
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

    private async Task<WithRawResponse<User>> GetorganizationuserAsyncCore(
        OrganizationsGetOrganizationUserRequest request,
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
                    Method = HttpMethod.Get,
                    Path = string.Format(
                        "{0}/organizations/{1}/users/{2}",
                        ValueConvert.ToPathParameterString(request.TenantId),
                        ValueConvert.ToPathParameterString(request.OrganizationId),
                        ValueConvert.ToPathParameterString(request.UserId)
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

    private async Task<WithRawResponse<IEnumerable<Organization>>> SearchorganizationsAsyncCore(
        OrganizationsSearchOrganizationsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _queryString = new SeedApi.Core.QueryStringBuilder.Builder(capacity: 1)
            .Add("limit", request.Limit)
            .MergeAdditional(options?.AdditionalQueryParameters)
            .Build();
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
                    Method = HttpMethod.Get,
                    Path = string.Format(
                        "{0}/organizations/{1}/search",
                        ValueConvert.ToPathParameterString(request.TenantId),
                        ValueConvert.ToPathParameterString(request.OrganizationId)
                    ),
                    QueryString = _queryString,
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
                var responseData = JsonUtils.Deserialize<IEnumerable<Organization>>(responseBody)!;
                return new WithRawResponse<IEnumerable<Organization>>()
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
    /// await client.Organizations.GetorganizationAsync(
    ///     new OrganizationsGetOrganizationRequest
    ///     {
    ///         TenantId = "tenant_id",
    ///         OrganizationId = "organization_id",
    ///     }
    /// );
    /// </code></example>
    public WithRawResponseTask<Organization> GetorganizationAsync(
        OrganizationsGetOrganizationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<Organization>(
            GetorganizationAsyncCore(request, options, cancellationToken)
        );
    }

    /// <example><code>
    /// await client.Organizations.GetorganizationuserAsync(
    ///     new OrganizationsGetOrganizationUserRequest
    ///     {
    ///         TenantId = "tenant_id",
    ///         OrganizationId = "organization_id",
    ///         UserId = "user_id",
    ///     }
    /// );
    /// </code></example>
    public WithRawResponseTask<User> GetorganizationuserAsync(
        OrganizationsGetOrganizationUserRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<User>(
            GetorganizationuserAsyncCore(request, options, cancellationToken)
        );
    }

    /// <example><code>
    /// await client.Organizations.SearchorganizationsAsync(
    ///     new OrganizationsSearchOrganizationsRequest
    ///     {
    ///         TenantId = "tenant_id",
    ///         OrganizationId = "organization_id",
    ///     }
    /// );
    /// </code></example>
    public WithRawResponseTask<IEnumerable<Organization>> SearchorganizationsAsync(
        OrganizationsSearchOrganizationsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<IEnumerable<Organization>>(
            SearchorganizationsAsyncCore(request, options, cancellationToken)
        );
    }
}
