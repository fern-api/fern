using System.Text.Json;
using OneOf;
using SeedApi.Core;

namespace SeedApi;

public partial class SeedApiClient : ISeedApiClient
{
    private readonly RawClient _client;

    public SeedApiClient(string? token = null, ClientOptions? clientOptions = null)
    {
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "Authorization", $"Bearer {token ?? ""}" },
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedApi" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernmultiple-request-bodies/0.0.1" },
            }
        );
        clientOptions ??= new ClientOptions();
        foreach (var header in defaultHeaders)
        {
            if (!clientOptions.Headers.ContainsKey(header.Key))
            {
                clientOptions.Headers[header.Key] = header.Value;
            }
        }
        _client = new RawClient(clientOptions);
    }

    private async Task<
        WithRawResponse<OneOf<DocumentMetadata, DocumentUploadResult>>
    > UploadJsonDocumentAsyncCore(
        UploadDocumentRequest request,
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
                    Path = "documents/upload",
                    Body = request,
                    ContentType = "application/json",
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
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
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
        var response = await _client
            .SendRequestAsync(
                new StreamRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Post,
                    Path = "documents/upload",
                    Body = request,
                    ContentType = "application/pdf",
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
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedApiApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <example><code>
    /// await client.UploadJsonDocumentAsync(new UploadDocumentRequest());
    /// </code></example>
    public WithRawResponseTask<
        OneOf<DocumentMetadata, DocumentUploadResult>
    > UploadJsonDocumentAsync(
        UploadDocumentRequest request,
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
