using System.Text.Json;
using SeedMixedFileDirectory.Core;

namespace SeedMixedFileDirectory;

public partial class OrganizationClient : IOrganizationClient
{
    private RawClient _client;

    internal OrganizationClient(RawClient client)
    {
        _client = client;
    }

    private async Task<WithRawResponse<Organization>> CreateAsyncCore(
        CreateOrganizationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
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
                throw new SeedMixedFileDirectoryApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
            }
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedMixedFileDirectoryApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <summary>
    /// Create a new organization.
    /// </summary>
    /// <example><code>
    /// await client.Organization.CreateAsync(new CreateOrganizationRequest { Name = "name" });
    /// </code></example>
    public WithRawResponseTask<Organization> CreateAsync(
        CreateOrganizationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<Organization>(
            CreateAsyncCore(request, options, cancellationToken)
        );
    }
}
