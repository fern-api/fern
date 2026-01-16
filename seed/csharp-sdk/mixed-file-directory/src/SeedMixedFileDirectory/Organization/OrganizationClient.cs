using System.Text.Json;
using SeedMixedFileDirectory.Core;

namespace SeedMixedFileDirectory;

public partial class OrganizationClient : IOrganizationClient
{
    private RawClient _client;

    internal OrganizationClient(RawClient client)
    {
        _client = client;
        Raw = new RawAccessClient(_client);
    }

    public OrganizationClient.RawAccessClient Raw { get; }

    /// <summary>
    /// Create a new organization.
    /// </summary>
    /// <example><code>
    /// await client.Organization.CreateAsync(new CreateOrganizationRequest { Name = "name" });
    /// </code></example>
    public async Task<Organization> CreateAsync(
        CreateOrganizationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await Raw.CreateAsync(request, options, cancellationToken);
        return response.Data;
    }

    public partial class RawAccessClient
    {
        private readonly RawClient _client;

        internal RawAccessClient(RawClient client)
        {
            _client = client;
        }

        /// <summary>
        /// Create a new organization.
        /// </summary>
        public async Task<WithRawResponse<Organization>> CreateAsync(
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
                    throw new SeedMixedFileDirectoryException("Failed to deserialize response", e);
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
    }
}
