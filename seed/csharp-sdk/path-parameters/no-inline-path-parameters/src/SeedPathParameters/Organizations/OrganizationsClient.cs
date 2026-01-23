using System.Text.Json;
using SeedPathParameters.Core;

namespace SeedPathParameters;

public partial class OrganizationsClient : IOrganizationsClient
{
    private RawClient _client;

    internal OrganizationsClient(RawClient client)
    {
        _client = client;
    }

    private async Task<WithRawResponse<Organization>> GetOrganizationAsyncCore(
        string tenantId,
        string organizationId,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Get,
                    Path = string.Format(
                        "/{0}/organizations/{1}/",
                        ValueConvert.ToPathParameterString(tenantId),
                        ValueConvert.ToPathParameterString(organizationId)
                    ),
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
                throw new SeedPathParametersApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
            }
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedPathParametersApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    private async Task<WithRawResponse<User>> GetOrganizationUserAsyncCore(
        string tenantId,
        string organizationId,
        string userId,
        GetOrganizationUserRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Get,
                    Path = string.Format(
                        "/{0}/organizations/{1}/users/{2}",
                        ValueConvert.ToPathParameterString(tenantId),
                        ValueConvert.ToPathParameterString(organizationId),
                        ValueConvert.ToPathParameterString(userId)
                    ),
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
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedPathParametersApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    private async Task<WithRawResponse<IEnumerable<Organization>>> SearchOrganizationsAsyncCore(
        string tenantId,
        string organizationId,
        SearchOrganizationsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _queryBuilder = new SeedPathParameters.Core.QueryStringBuilder.Builder(capacity: 1);
        if (request.Limit != null)
        {
            _queryBuilder.Add("limit", request.Limit);
        }
        var _queryString = _queryBuilder
            .MergeAdditional(options?.AdditionalQueryParameters)
            .Build();
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Get,
                    Path = string.Format(
                        "/{0}/organizations/{1}/search",
                        ValueConvert.ToPathParameterString(tenantId),
                        ValueConvert.ToPathParameterString(organizationId)
                    ),
                    QueryString = _queryString,
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
                throw new SeedPathParametersApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
            }
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedPathParametersApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <example><code>
    /// await client.Organizations.GetOrganizationAsync("tenant_id", "organization_id");
    /// </code></example>
    public WithRawResponseTask<Organization> GetOrganizationAsync(
        string tenantId,
        string organizationId,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<Organization>(
            GetOrganizationAsyncCore(tenantId, organizationId, options, cancellationToken)
        );
    }

    /// <example><code>
    /// await client.Organizations.GetOrganizationUserAsync(
    ///     "tenant_id",
    ///     "organization_id",
    ///     "user_id",
    ///     new GetOrganizationUserRequest()
    /// );
    /// </code></example>
    public WithRawResponseTask<User> GetOrganizationUserAsync(
        string tenantId,
        string organizationId,
        string userId,
        GetOrganizationUserRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<User>(
            GetOrganizationUserAsyncCore(
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
    /// await client.Organizations.SearchOrganizationsAsync(
    ///     "tenant_id",
    ///     "organization_id",
    ///     new SearchOrganizationsRequest { Limit = 1 }
    /// );
    /// </code></example>
    public WithRawResponseTask<IEnumerable<Organization>> SearchOrganizationsAsync(
        string tenantId,
        string organizationId,
        SearchOrganizationsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<IEnumerable<Organization>>(
            SearchOrganizationsAsyncCore(
                tenantId,
                organizationId,
                request,
                options,
                cancellationToken
            )
        );
    }
}
