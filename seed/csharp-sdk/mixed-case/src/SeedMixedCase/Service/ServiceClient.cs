using System.Text.Json;
using SeedMixedCase.Core;

namespace SeedMixedCase;

public partial class ServiceClient : IServiceClient
{
    private RawClient _client;

    internal ServiceClient(RawClient client)
    {
        _client = client;
    }

    private async Task<WithRawResponse<Resource>> GetResourceAsyncCore(
        string resourceId,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Get,
                    Path = string.Format(
                        "/resource/{0}",
                        ValueConvert.ToPathParameterString(resourceId)
                    ),
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
                var responseData = JsonUtils.Deserialize<Resource>(responseBody)!;
                return new WithRawResponse<Resource>()
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
                throw new SeedMixedCaseApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
            }
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedMixedCaseApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    private async Task<WithRawResponse<IEnumerable<Resource>>> ListResourcesAsyncCore(
        ListResourcesRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _queryString = new SeedMixedCase.Core.QueryStringBuilder.Builder(capacity: 2)
            .Add("page_limit", request.PageLimit)
            .Add("beforeDate", request.BeforeDate)
            .MergeAdditional(options?.AdditionalQueryParameters)
            .Build();
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Get,
                    Path = "/resource",
                    QueryString = _queryString,
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
                var responseData = JsonUtils.Deserialize<IEnumerable<Resource>>(responseBody)!;
                return new WithRawResponse<IEnumerable<Resource>>()
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
                throw new SeedMixedCaseApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
            }
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedMixedCaseApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <example><code>
    /// await client.Service.GetResourceAsync("rsc-xyz");
    /// </code></example>
    public WithRawResponseTask<Resource> GetResourceAsync(
        string resourceId,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<Resource>(
            GetResourceAsyncCore(resourceId, options, cancellationToken)
        );
    }

    /// <example><code>
    /// await client.Service.ListResourcesAsync(
    ///     new ListResourcesRequest { PageLimit = 10, BeforeDate = new DateOnly(2023, 1, 1) }
    /// );
    /// </code></example>
    public WithRawResponseTask<IEnumerable<Resource>> ListResourcesAsync(
        ListResourcesRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<IEnumerable<Resource>>(
            ListResourcesAsyncCore(request, options, cancellationToken)
        );
    }
}
