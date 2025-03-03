using System.Net.Http;
using System.Text.Json;
using System.Threading;
using SeedPathParameters.Core;

namespace SeedPathParameters;

public partial class OrganizationsClient
{
    private RawClient _client;

    internal OrganizationsClient(RawClient client)
    {
        _client = client;
    }

    /// <example>
    /// <code>
    /// await client.Organizations.GetOrganizationAsync("tenant_id", "organization_id");
    /// </code>
    /// </example>
    public async Task<Organization> GetOrganizationAsync(
        string tenantId,
        string organizationId,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new RawClient.JsonApiRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Get,
                    Path =
                        $"/{JsonUtils.SerializeAsString(tenantId)}/organizations/{JsonUtils.SerializeAsString(organizationId)}/",
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
                return JsonUtils.Deserialize<Organization>(responseBody)!;
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

    /// <example>
    /// <code>
    /// await client.Organizations.GetOrganizationUserAsync(
    ///     new GetOrganizationUserRequest
    ///     {
    ///         TenantId = "tenant_id",
    ///         OrganizationId = "organization_id",
    ///         UserId = "user_id",
    ///     }
    /// );
    /// </code>
    /// </example>
    public async Task<User> GetOrganizationUserAsync(
        GetOrganizationUserRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new RawClient.JsonApiRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Get,
                    Path =
                        $"/{JsonUtils.SerializeAsString(request.TenantId)}/organizations/{JsonUtils.SerializeAsString(request.OrganizationId)}/users/{JsonUtils.SerializeAsString(request.UserId)}",
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
                return JsonUtils.Deserialize<User>(responseBody)!;
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

    /// <example>
    /// <code>
    /// await client.Organizations.SearchOrganizationsAsync(
    ///     "tenant_id",
    ///     "organization_id",
    ///     new SearchOrganizationsRequest { Limit = 1 }
    /// );
    /// </code>
    /// </example>
    public async Task<IEnumerable<Organization>> SearchOrganizationsAsync(
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
                new RawClient.JsonApiRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Get,
                    Path =
                        $"/{JsonUtils.SerializeAsString(tenantId)}/organizations/{JsonUtils.SerializeAsString(organizationId)}/search",
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
                return JsonUtils.Deserialize<IEnumerable<Organization>>(responseBody)!;
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
