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
    }

    private async Task<WithRawResponse<Metadata>> GetMetadataAsyncCore(
        GetEventMetadataRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _queryString = new SeedMixedFileDirectory.Core.QueryStringBuilder.Builder(capacity: 1)
            .Add("id", request.Id)
            .MergeAdditional(options?.AdditionalQueryParameters)
            .Build();
        var _headers = await new SeedMixedFileDirectory.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Get,
                    Path = "/users/events/metadata/",
                    QueryString = _queryString,
                    Headers = _headers,
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
                var responseData = JsonUtils.Deserialize<Metadata>(responseBody)!;
                return new WithRawResponse<Metadata>()
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
    /// Get event metadata.
    /// </summary>
    /// <example><code>
    /// await client.User.Events.Metadata.GetMetadataAsync(new GetEventMetadataRequest { Id = "id" });
    /// </code></example>
    public WithRawResponseTask<Metadata> GetMetadataAsync(
        GetEventMetadataRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<Metadata>(
            GetMetadataAsyncCore(request, options, cancellationToken)
        );
    }
}
