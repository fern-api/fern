using System.Net.Http;
using System.Text.Json;
using System.Threading;
using SeedMixedFileDirectory.Core;

namespace SeedMixedFileDirectory;

public partial class OrganizationClient
{
    private RawClient _client;

    internal OrganizationClient(RawClient client)
    {
        _client = client;
    }

    /// <summary>
    /// Create a new organization.
    /// </summary>
    /// <example>
    /// <code>
    /// await client.Organization.CreateAsync(new CreateOrganizationRequest { Name = "name" });
    /// </code>
    /// </example>
    public async Task<Organization> CreateAsync(
        CreateOrganizationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .MakeRequestAsync(
                new RawClient.JsonApiRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Post,
                    Path = "/organizations/",
                    Body = request,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            try
            {
                return JsonUtils.Deserialize<Organization>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedMixedFileDirectoryException("Failed to deserialize response", e);
            }
        }

        throw new SeedMixedFileDirectoryApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }
}
