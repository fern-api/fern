using global::System.Text.Json;
using SeedApi.Core;

namespace SeedApi;

public partial class CatalogClient : ICatalogClient
{
    private readonly RawClient _client;

    internal CatalogClient(RawClient client)
    {
        _client = client;
    }

    private async Task<WithRawResponse<CatalogImage>> CreateCatalogImageAsyncCore(
        CreateCatalogImageBody request,
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
        var multipartFormRequest_ = new MultipartFormRequest
        {
            Method = HttpMethod.Post,
            Path = "catalog/images",
            Headers = _headers,
            Options = options,
        };
        multipartFormRequest_.AddJsonPart("request", request.Request);
        multipartFormRequest_.AddFileParameterPart("image_file", request.ImageFile);
        var response = await _client
            .SendRequestAsync(multipartFormRequest_, cancellationToken)
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            try
            {
                var responseData = JsonUtils.Deserialize<CatalogImage>(responseBody)!;
                return new WithRawResponse<CatalogImage>()
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

    private async Task<WithRawResponse<CatalogImage>> GetCatalogImageAsyncCore(
        GetCatalogImageRequest request,
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
                    Method = HttpMethod.Get,
                    Path = string.Format(
                        "catalog/images/{0}",
                        ValueConvert.ToPathParameterString(request.ImageId)
                    ),
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
                var responseData = JsonUtils.Deserialize<CatalogImage>(responseBody)!;
                return new WithRawResponse<CatalogImage>()
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
    /// await client.Catalog.CreateCatalogImageAsync(
    ///     new CreateCatalogImageBody
    ///     {
    ///         Request = new CreateCatalogImageRequest { CatalogObjectId = "catalog_object_id" },
    ///     }
    /// );
    /// </code></example>
    public WithRawResponseTask<CatalogImage> CreateCatalogImageAsync(
        CreateCatalogImageBody request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<CatalogImage>(
            CreateCatalogImageAsyncCore(request, options, cancellationToken)
        );
    }

    /// <example><code>
    /// await client.Catalog.GetCatalogImageAsync(new GetCatalogImageRequest { ImageId = "image_id" });
    /// </code></example>
    public WithRawResponseTask<CatalogImage> GetCatalogImageAsync(
        GetCatalogImageRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<CatalogImage>(
            GetCatalogImageAsyncCore(request, options, cancellationToken)
        );
    }
}
