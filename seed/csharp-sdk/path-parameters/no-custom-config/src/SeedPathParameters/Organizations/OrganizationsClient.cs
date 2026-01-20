using System.Text.Json;
using SeedPathParameters.Core;

namespace SeedPathParameters;

public partial class OrganizationsClient : IOrganizationsClient
{
    private RawClient _client;

    internal OrganizationsClient(RawClient client)
    {
        _client = client;
        Raw = new WithRawResponseClient(_client);
    }

    public OrganizationsClient.WithRawResponseClient Raw { get; }

    /// <example><code>
    /// await client.Organizations.GetOrganizationAsync("tenant_id", "organization_id");
    /// </code></example>
    public async Task<Organization> GetOrganizationAsync(
        string tenantId,
        string organizationId,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await Raw.GetOrganizationAsync(
            tenantId,
            organizationId,
            options,
            cancellationToken
        );
        return response.Data;
    }

    /// <example><code>
    /// await client.Organizations.GetOrganizationUserAsync(
    ///     new GetOrganizationUserRequest
    ///     {
    ///         TenantId = "tenant_id",
    ///         OrganizationId = "organization_id",
    ///         UserId = "user_id",
    ///     }
    /// );
    /// </code></example>
    public async Task<User> GetOrganizationUserAsync(
        GetOrganizationUserRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await Raw.GetOrganizationUserAsync(request, options, cancellationToken);
        return response.Data;
    }

    /// <example><code>
    /// await client.Organizations.SearchOrganizationsAsync(
    ///     "tenant_id",
    ///     "organization_id",
    ///     new SearchOrganizationsRequest { Limit = 1 }
    /// );
    /// </code></example>
    public async Task<IEnumerable<Organization>> SearchOrganizationsAsync(
        string tenantId,
        string organizationId,
        SearchOrganizationsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await Raw.SearchOrganizationsAsync(
            tenantId,
            organizationId,
            request,
            options,
            cancellationToken
        );
        return response.Data;
    }

    public partial class WithRawResponseClient
    {
        private readonly RawClient _client;

        internal WithRawResponseClient(RawClient client)
        {
            _client = client;
        }

        public async Task<WithRawResponse<Organization>> GetOrganizationAsync(
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
                    var data = JsonUtils.Deserialize<Organization>(responseBody)!;
                    return new WithRawResponse<Organization>
                    {
                        Data = data,
                        RawResponse = new RawResponse
                        {
                            StatusCode = (global::System.Net.HttpStatusCode)response.StatusCode,
                            Url = response.Raw.RequestMessage?.RequestUri!,
                            Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                        },
                    };
                }
                catch (JsonException e)
                {
                    throw new SeedPathParametersException("Failed to deserialize response", e);
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

        public async Task<WithRawResponse<User>> GetOrganizationUserAsync(
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
                            ValueConvert.ToPathParameterString(request.TenantId),
                            ValueConvert.ToPathParameterString(request.OrganizationId),
                            ValueConvert.ToPathParameterString(request.UserId)
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
                    var data = JsonUtils.Deserialize<User>(responseBody)!;
                    return new WithRawResponse<User>
                    {
                        Data = data,
                        RawResponse = new RawResponse
                        {
                            StatusCode = (global::System.Net.HttpStatusCode)response.StatusCode,
                            Url = response.Raw.RequestMessage?.RequestUri!,
                            Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                        },
                    };
                }
                catch (JsonException e)
                {
                    throw new SeedPathParametersException("Failed to deserialize response", e);
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

        public async Task<WithRawResponse<IEnumerable<Organization>>> SearchOrganizationsAsync(
            string tenantId,
            string organizationId,
            SearchOrganizationsRequest request,
            RequestOptions? options = null,
            CancellationToken cancellationToken = default
        )
        {
            var _query = new Dictionary<string, object>();
            if (request.Limit != null)
            {
                _query["limit"] = request.Limit.Value.ToString();
            }
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
                        Query = _query,
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
                    var data = JsonUtils.Deserialize<IEnumerable<Organization>>(responseBody)!;
                    return new WithRawResponse<IEnumerable<Organization>>
                    {
                        Data = data,
                        RawResponse = new RawResponse
                        {
                            StatusCode = (global::System.Net.HttpStatusCode)response.StatusCode,
                            Url = response.Raw.RequestMessage?.RequestUri!,
                            Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                        },
                    };
                }
                catch (JsonException e)
                {
                    throw new SeedPathParametersException("Failed to deserialize response", e);
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
    }
}
