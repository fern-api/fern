using System.Net.Http;
using System.Text.Json;
using System.Threading;
using SeedPathParameters.Core;

#nullable enable

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
    /// await client.Organizations.GetOrganizationAsync("tenantId", "organizationId");
    /// </code>
    /// </example>
    public async Task<Organization> GetOrganizationAsync(
        string tenantId,
        string organizationId,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Get,
                Path = $"/{tenantId}/organizations/{organizationId}/",
                Options = options,
            },
            cancellationToken
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            try
            {
                return JsonUtils.Deserialize<Organization>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedPathParametersException("Failed to deserialize response", e);
            }
        }

        throw new SeedPathParametersApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }

    /// <example>
    /// <code>
    /// await client.Organizations.GetOrganizationUserAsync(
    ///     "tenantId",
    ///     "organizationId",
    ///     "userId",
    ///     new GetOrganizationUserRequest()
    /// );
    /// </code>
    /// </example>
    public async Task<User> GetOrganizationUserAsync(
        string tenantId,
        string organizationId,
        string userId,
        GetOrganizationUserRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Get,
                Path = $"/{tenantId}/organizations/{organizationId}/users/{userId}",
                Options = options,
            },
            cancellationToken
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            try
            {
                return JsonUtils.Deserialize<User>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedPathParametersException("Failed to deserialize response", e);
            }
        }

        throw new SeedPathParametersApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }

    /// <example>
    /// <code>
    /// await client.Organizations.SearchOrganizationsAsync(
    ///     "tenantId",
    ///     "organizationId",
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
            _query["limit"] = request.Limit.ToString();
        }
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Get,
                Path = $"/{tenantId}/organizations/{organizationId}/search",
                Query = _query,
                Options = options,
            },
            cancellationToken
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            try
            {
                return JsonUtils.Deserialize<IEnumerable<Organization>>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedPathParametersException("Failed to deserialize response", e);
            }
        }

        throw new SeedPathParametersApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }
}
