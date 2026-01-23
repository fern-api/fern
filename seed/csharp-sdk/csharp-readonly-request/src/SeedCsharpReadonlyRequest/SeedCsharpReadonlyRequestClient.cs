using System.Text.Json;
using SeedCsharpReadonlyRequest.Core;

namespace SeedCsharpReadonlyRequest;

public partial class SeedCsharpReadonlyRequestClient : ISeedCsharpReadonlyRequestClient
{
    private readonly RawClient _client;

    public SeedCsharpReadonlyRequestClient(ClientOptions? clientOptions = null)
    {
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedCsharpReadonlyRequest" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Ferncsharp-readonly-request/0.0.1" },
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

    private async Task<WithRawResponse<CreateVendorResponse>> BatchCreateAsyncCore(
        CreateVendorRequest request,
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
                    Path = "/vendors/batch",
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
                throw new SeedCsharpReadonlyRequestApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
            }
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedCsharpReadonlyRequestApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <example><code>
    /// await client.BatchCreateAsync(
    ///     new CreateVendorRequest
    ///     {
    ///         Vendors = new Dictionary&lt;string, Vendor&gt;()
    ///         {
    ///             {
    ///                 "vendor-1",
    ///                 new Vendor
    ///                 {
    ///                     Id = "vendor-1",
    ///                     Name = "Acme Corp",
    ///                     CreatedAt = "2024-01-01T00:00:00Z",
    ///                     UpdatedAt = "2024-01-01T00:00:00Z",
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
