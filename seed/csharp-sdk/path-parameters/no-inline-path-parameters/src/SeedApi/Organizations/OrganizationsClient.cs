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
        string tenantId,
        string organizationId,
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
                        ValueConvert.ToPathParameterString(tenantId),
                        ValueConvert.ToPathParameterString(organizationId)
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
        string tenantId,
        string organizationId,
        string userId,
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
                        ValueConvert.ToPathParameterString(tenantId),
                        ValueConvert.ToPathParameterString(organizationId),
                        ValueConvert.ToPathParameterString(userId)
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
        string tenantId,
        string organizationId,
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
                        ValueConvert.ToPathParameterString(tenantId),
                        ValueConvert.ToPathParameterString(organizationId)
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
    ///     "tenant_id",
    ///     "organization_id",
    ///     new OrganizationsGetOrganizationRequest()
    /// );
    /// </code></example>
    public WithRawResponseTask<Organization> GetorganizationAsync(
        string tenantId,
        string organizationId,
        OrganizationsGetOrganizationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<Organization>(
            GetorganizationAsyncCore(tenantId, organizationId, request, options, cancellationToken)
        );
    }

    /// <example><code>
    /// await client.Organizations.GetorganizationuserAsync(
    ///     "tenant_id",
    ///     "organization_id",
    ///     "user_id",
    ///     new OrganizationsGetOrganizationUserRequest()
    /// );
    /// </code></example>
    public WithRawResponseTask<User> GetorganizationuserAsync(
        string tenantId,
        string organizationId,
        string userId,
        OrganizationsGetOrganizationUserRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<User>(
            GetorganizationuserAsyncCore(
                tenantId,
                organizationId,
                userId,
                request,
                options,
                cancellationToken
            )
        );
    }

    /// <example><code>
    /// await client.Organizations.SearchorganizationsAsync(
    ///     "tenant_id",
    ///     "organization_id",
    ///     new OrganizationsSearchOrganizationsRequest()
    /// );
    /// </code></example>
    public WithRawResponseTask<IEnumerable<Organization>> SearchorganizationsAsync(
        string tenantId,
        string organizationId,
        OrganizationsSearchOrganizationsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<IEnumerable<Organization>>(
            SearchorganizationsAsyncCore(
                tenantId,
                organizationId,
                request,
                options,
                cancellationToken
            )
        );
    }
}
