using SeedBytesUpload.Core;

namespace SeedBytesUpload;

public partial class ServiceClient : IServiceClient
{
    private readonly RawClient _client;

    internal ServiceClient(RawClient client)
    {
        _client = client;
    }

    /// <example><code>
    /// await client.Service.UploadAsync(new MemoryStream(Encoding.UTF8.GetBytes("[bytes]")));
    /// </code></example>
    public async Task UploadAsync(
        Stream request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedBytesUpload.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var response = await _client
            .SendRequestAsync(
                new StreamRequest
                {
                    Method = HttpMethod.Post,
                    Path = "upload-content",
                    Body = request,
                    Headers = _headers,
                    ContentType = "application/octet-stream",
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            throw new SeedBytesUploadApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <example><code>
    /// await client.Service.UploadWithQueryParamsAsync(
    ///     new UploadWithQueryParamsRequest { Model = "nova-2" }
    /// );
    /// </code></example>
    public async Task UploadWithQueryParamsAsync(
        UploadWithQueryParamsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _queryString = new SeedBytesUpload.Core.QueryStringBuilder.Builder(capacity: 2)
            .Add("model", request.Model)
            .Add("language", request.Language)
            .MergeAdditional(options?.AdditionalQueryParameters)
            .Build();
        var _headers = await new SeedBytesUpload.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var response = await _client
            .SendRequestAsync(
                new StreamRequest
                {
                    Method = HttpMethod.Post,
                    Path = "upload-content-with-query-params",
                    Body = request.Body,
                    QueryString = _queryString,
                    Headers = _headers,
                    ContentType = "application/octet-stream",
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            throw new SeedBytesUploadApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }
}
