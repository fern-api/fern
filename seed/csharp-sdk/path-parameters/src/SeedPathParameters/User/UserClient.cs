using System.Net.Http;
using System.Text.Json;
using System.Threading;
using SeedPathParameters.Core;

#nullable enable

namespace SeedPathParameters;

public partial class UserClient
{
    private RawClient _client;

    internal UserClient(RawClient client)
    {
        _client = client;
    }

    /// <example>
    /// <code>
    /// await client.User.GetOrganizationAsync("organizationId");
    /// </code>
    /// </example>
    public async Task<User> GetOrganizationAsync(
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
                Path = $"/user/organizations/{organizationId}",
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
    /// await client.User.GetUserAsync("userId", new GetUsersRequest());
    /// </code>
    /// </example>
    public async Task<User> GetUserAsync(
        string userId,
        GetUsersRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Get,
                Path = $"/user/users/{userId}",
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
    /// await client.User.GetOrganizationUserAsync(
    ///     "organizationId",
    ///     "userId",
    ///     new GetOrganizationUserRequest()
    /// );
    /// </code>
    /// </example>
    public async Task<User> GetOrganizationUserAsync(
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
                Path = $"/user/organizations/{organizationId}/users/{userId}",
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
}
