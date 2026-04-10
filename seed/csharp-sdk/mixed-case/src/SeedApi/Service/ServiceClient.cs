using global::System.Text.Json;
using OneOf;
using SeedApi.Core;

namespace SeedApi;

public partial class ServiceClient : IServiceClient
{
    private readonly RawClient _client;

    internal ServiceClient(RawClient client)
    {
        _client = client;
    }

    private async Task<WithRawResponse<OneOf<ResourceZero, ResourceOne>>> GetresourceAsyncCore(
        ServiceGetResourceRequest request,
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
                        "resource/{0}",
                        ValueConvert.ToPathParameterString(request.ResourceId)
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
                var responseData = JsonUtils.Deserialize<OneOf<ResourceZero, ResourceOne>>(
                    responseBody
                )!;
                return new WithRawResponse<OneOf<ResourceZero, ResourceOne>>()
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
        WithRawResponse<IEnumerable<OneOf<ResourceZero, ResourceOne>>>
    > ListresourcesAsyncCore(
        ServiceListResourcesRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _queryString = new SeedApi.Core.QueryStringBuilder.Builder(capacity: 2)
            .Add("page_limit", request.PageLimit)
            .Add("beforeDate", request.BeforeDate)
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
                    Path = "resource",
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
                var responseData = JsonUtils.Deserialize<
                    IEnumerable<OneOf<ResourceZero, ResourceOne>>
                >(responseBody)!;
                return new WithRawResponse<IEnumerable<OneOf<ResourceZero, ResourceOne>>>()
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
    /// await client.Service.GetresourceAsync(new ServiceGetResourceRequest { ResourceId = "ResourceID" });
    /// </code></example>
    public WithRawResponseTask<OneOf<ResourceZero, ResourceOne>> GetresourceAsync(
        ServiceGetResourceRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<OneOf<ResourceZero, ResourceOne>>(
            GetresourceAsyncCore(request, options, cancellationToken)
        );
    }

    /// <example><code>
    /// await client.Service.ListresourcesAsync(
    ///     new ServiceListResourcesRequest { PageLimit = 1, BeforeDate = new DateOnly(2023, 1, 15) }
    /// );
    /// </code></example>
    public WithRawResponseTask<IEnumerable<OneOf<ResourceZero, ResourceOne>>> ListresourcesAsync(
        ServiceListResourcesRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<IEnumerable<OneOf<ResourceZero, ResourceOne>>>(
            ListresourcesAsyncCore(request, options, cancellationToken)
        );
    }
}
