using System.Text.Json;
using SeedMixedFileDirectory;
using SeedMixedFileDirectory.Core;

namespace SeedMixedFileDirectory.User_.Events;

public partial class MetadataClient : IMetadataClient
{
    private RawClient _client;

    internal MetadataClient(RawClient client)
    {
        _client = client;
        Raw = new RawAccessClient(_client);
    }

    public MetadataClient.RawAccessClient Raw { get; }

    /// <summary>
    /// Get event metadata.
    /// </summary>
    /// <example><code>
    /// await client.User.Events.Metadata.GetMetadataAsync(new GetEventMetadataRequest { Id = "id" });
    /// </code></example>
    public async Task<Metadata> GetMetadataAsync(
        GetEventMetadataRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await Raw.GetMetadataAsync(request, options, cancellationToken);
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
        /// Get event metadata.
        /// </summary>
        public async Task<WithRawResponse<Metadata>> GetMetadataAsync(
            GetEventMetadataRequest request,
            RequestOptions? options = null,
            CancellationToken cancellationToken = default
        )
        {
            var _query = new Dictionary<string, object>();
            _query["id"] = request.Id;
            var response = await _client
                .SendRequestAsync(
                    new JsonRequest
                    {
                        BaseUrl = _client.Options.BaseUrl,
                        Method = HttpMethod.Get,
                        Path = "/users/events/metadata/",
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
                    var data = JsonUtils.Deserialize<Metadata>(responseBody)!;
                    return new WithRawResponse<Metadata>
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
