using global::System.Text.Json;
using SeedApi.Core;

namespace SeedApi;

public partial class FolderAServiceClient : IFolderAServiceClient
{
    private readonly RawClient _client;

    internal FolderAServiceClient(RawClient client)
    {
        _client = client;
    }

    private async Task<WithRawResponse<FolderAResponse>> FolderAServiceGetDirectThreadAsyncCore(
        FolderAServiceGetDirectThreadRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _queryString = new SeedApi.Core.QueryStringBuilder.Builder(capacity: 2)
            .Add("ids", request.Ids)
            .Add("tags", request.Tags)
            .MergeAdditional(options?.AdditionalQueryParameters)
            .Build();
        var _headers = await new SeedApi.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    Method = HttpMethod.Get,
                    Path = "",
                    QueryString = _queryString,
                    Headers = _headers,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            try
            {
                var responseData = JsonUtils.Deserialize<FolderAResponse>(responseBody)!;
                return new WithRawResponse<FolderAResponse>()
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
                throw new SeedApiApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
            }
        }
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            throw new SeedApiApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <example><code>
    /// await client.FolderAService.FolderAServiceGetDirectThreadAsync(
    ///     new FolderAServiceGetDirectThreadRequest { Ids = ["ids"], Tags = ["tags"] }
    /// );
    /// </code></example>
    public WithRawResponseTask<FolderAResponse> FolderAServiceGetDirectThreadAsync(
        FolderAServiceGetDirectThreadRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<FolderAResponse>(
            FolderAServiceGetDirectThreadAsyncCore(request, options, cancellationToken)
        );
    }
}
