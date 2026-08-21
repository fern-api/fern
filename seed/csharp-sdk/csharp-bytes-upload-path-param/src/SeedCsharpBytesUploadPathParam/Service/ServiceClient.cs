using SeedCsharpBytesUploadPathParam.Core;

namespace SeedCsharpBytesUploadPathParam;

public partial class ServiceClient : IServiceClient
{
    private readonly RawClient _client;

    internal ServiceClient(RawClient client)
    {
        _client = client;
    }

    private async Task<RawResponse> UploadWithPathParamAsyncCore(
        string objectPath,
        long revision,
        DateTime uploadedAt,
        BucketRegion region,
        Stream request,
        string? tenantId = null,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _queryString = new SeedCsharpBytesUploadPathParam.Core.QueryStringBuilder.Builder(
            capacity: 0
        )
            .MergeAdditional(options?.AdditionalQueryParameters)
            .Build();
        var _headers = await new SeedCsharpBytesUploadPathParam.Core.HeadersBuilder.Builder()
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
                    Path = string.Format(
                        "upload-content/{0}/{1}/{2}/{3}/{4}",
                        ValueConvert.ToPathParameterString(tenantId ?? "acme"),
                        ValueConvert.ToPathParameterString(objectPath),
                        ValueConvert.ToPathParameterString(revision),
                        ValueConvert.ToPathParameterString(uploadedAt),
                        ValueConvert.ToPathParameterString(region)
                    ),
                    Body = request,
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
            return new SeedCsharpBytesUploadPathParam.RawResponse()
            {
                StatusCode = response.Raw.StatusCode,
                Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
            };
        }
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            throw new SeedCsharpBytesUploadPathParamApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody,
                rawResponse: new SeedCsharpBytesUploadPathParam.RawResponse()
                {
                    StatusCode = response.Raw.StatusCode,
                    Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                    Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                }
            );
        }
    }

    private async Task<RawResponse> UpdateMetadataWithPathParamAsyncCore(
        UpdateMetadataRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _queryString = new SeedCsharpBytesUploadPathParam.Core.QueryStringBuilder.Builder(
            capacity: 1
        )
            .Add("label", request.Label)
            .MergeAdditional(options?.AdditionalQueryParameters)
            .Build();
        var _headers = await new SeedCsharpBytesUploadPathParam.Core.HeadersBuilder.Builder()
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
                    Path = string.Format(
                        "upload-content/{0}/{1}/metadata",
                        ValueConvert.ToPathParameterString(request.TenantId),
                        ValueConvert.ToPathParameterString(request.ObjectPath)
                    ),
                    QueryString = _queryString,
                    Headers = _headers,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            return new SeedCsharpBytesUploadPathParam.RawResponse()
            {
                StatusCode = response.Raw.StatusCode,
                Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
            };
        }
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            throw new SeedCsharpBytesUploadPathParamApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody,
                rawResponse: new SeedCsharpBytesUploadPathParam.RawResponse()
                {
                    StatusCode = response.Raw.StatusCode,
                    Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                    Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                }
            );
        }
    }

    /// <summary>
    /// Bytes endpoint with required path parameters whose only example supplies no
    /// path-parameter values (autogenerated examples are skipped for bytes bodies). The
    /// generated example must still pass a value of the declared type for every path
    /// parameter instead of omitting it or passing `undefined`. A parameter with a client
    /// default is left out of the example, since the client supplies it.
    /// </summary>
    /// <example><code>
    /// await client.Service.UploadWithPathParamAsync(
    ///     "objectPath",
    ///     1000000,
    ///     new DateTime(2024, 01, 15, 09, 30, 00, 000),
    ///     BucketRegion.UsEast,
    ///     new MemoryStream(Encoding.UTF8.GetBytes("[bytes]"))
    /// );
    /// </code></example>
    public WithRawResponseTask UploadWithPathParamAsync(
        string objectPath,
        long revision,
        DateTime uploadedAt,
        BucketRegion region,
        Stream request,
        string? tenantId = null,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask(
            UploadWithPathParamAsyncCore(
                objectPath,
                revision,
                uploadedAt,
                region,
                request,
                tenantId,
                options,
                cancellationToken
            )
        );
    }

    /// <summary>
    /// Endpoint with a request wrapper carrying the path parameters. Its second example
    /// supplies no path-parameter values, so the generated example must still populate every
    /// path parameter the wrapper carries (`inline-path-parameters`).
    /// </summary>
    /// <example><code>
    /// await client.Service.UpdateMetadataWithPathParamAsync(
    ///     new UpdateMetadataRequest
    ///     {
    ///         TenantId = "acme",
    ///         ObjectPath = "path/to/object.txt",
    ///         Label = "primary",
    ///     }
    /// );
    /// </code></example>
    public WithRawResponseTask UpdateMetadataWithPathParamAsync(
        UpdateMetadataRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask(
            UpdateMetadataWithPathParamAsyncCore(request, options, cancellationToken)
        );
    }
}
