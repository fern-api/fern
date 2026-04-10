using global::System.Text.Json;
using SeedApi.Core;

namespace SeedApi;

public partial class Client : IClient
{
    private readonly RawClient _client;

    internal Client(RawClient client)
    {
        _client = client;
    }

    private async Task<WithRawResponse<CreateVendorResponse>> BatchCreateAsyncCore(
        CreateVendorRequest request,
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
                    Path = "vendors/batch",
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
                var responseData = JsonUtils.Deserialize<CreateVendorResponse>(responseBody)!;
                return new WithRawResponse<CreateVendorResponse>()
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
    /// await client._.BatchCreateAsync(
    ///     new CreateVendorRequest
    ///     {
    ///         Vendors = new Dictionary&lt;string, Vendor&gt;()
    ///         {
    ///             {
    ///                 "key",
    ///                 new Vendor
    ///                 {
    ///                     Id = "id",
    ///                     Name = "name",
    ///                     CreatedAt = "created_at",
    ///                     UpdatedAt = "updated_at",
    ///                 }
    ///             },
    ///         },
    ///     }
    /// );
    /// </code></example>
    public WithRawResponseTask<CreateVendorResponse> BatchCreateAsync(
        CreateVendorRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<CreateVendorResponse>(
            BatchCreateAsyncCore(request, options, cancellationToken)
        );
    }
}
