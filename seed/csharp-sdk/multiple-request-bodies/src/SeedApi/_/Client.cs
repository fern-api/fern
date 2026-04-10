using global::System.Text.Json;
using OneOf;
using SeedApi.Core;

namespace SeedApi;

public partial class Client : IClient
{
    private readonly RawClient _client;

    internal Client(RawClient client)
    {
        _client = client;
    }

    private async Task<
        WithRawResponse<OneOf<DocumentMetadata, DocumentUploadResult>>
    > UploadJsonDocumentAsyncCore(
        UploadJsonDocumentRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
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
                    Method = HttpMethod.Post,
                    Path = "documents/upload/json",
                    Body = request,
                    Headers = _headers,
                    ContentType = "application/json",
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
                var responseData = JsonUtils.Deserialize<
                    OneOf<DocumentMetadata, DocumentUploadResult>
                >(responseBody)!;
                return new WithRawResponse<OneOf<DocumentMetadata, DocumentUploadResult>>()
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

    private async Task<
        WithRawResponse<OneOf<DocumentMetadata, DocumentUploadResult>>
    > UploadPdfDocumentAsyncCore(
        Stream request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedApi.Core.HeadersBuilder.Builder()
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
                    Path = "documents/upload/pdf",
                    Body = request,
                    Headers = _headers,
                    ContentType = "application/pdf",
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
                var responseData = JsonUtils.Deserialize<
                    OneOf<DocumentMetadata, DocumentUploadResult>
                >(responseBody)!;
                return new WithRawResponse<OneOf<DocumentMetadata, DocumentUploadResult>>()
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
    /// await client._.UploadJsonDocumentAsync(new UploadJsonDocumentRequest());
    /// </code></example>
    public WithRawResponseTask<
        OneOf<DocumentMetadata, DocumentUploadResult>
    > UploadJsonDocumentAsync(
        UploadJsonDocumentRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<OneOf<DocumentMetadata, DocumentUploadResult>>(
            UploadJsonDocumentAsyncCore(request, options, cancellationToken)
        );
    }

    public WithRawResponseTask<
        OneOf<DocumentMetadata, DocumentUploadResult>
    > UploadPdfDocumentAsync(
        Stream request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<OneOf<DocumentMetadata, DocumentUploadResult>>(
            UploadPdfDocumentAsyncCore(request, options, cancellationToken)
        );
    }
}
