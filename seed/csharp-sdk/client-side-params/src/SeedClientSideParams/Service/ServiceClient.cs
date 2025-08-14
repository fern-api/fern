using System.Net.Http;
using System.Text.Json;
using System.Threading;
using SeedClientSideParams.Core;

namespace SeedClientSideParams;

public partial class ServiceClient
{
    private RawClient _client;

    internal ServiceClient(RawClient client)
    {
        _client = client;
    }

    /// <summary>
    /// List resources with pagination
    /// </summary>
    /// <example><code>
    /// await client.Service.ListResourcesAsync(
    ///     new ListResourcesRequest
    ///     {
    ///         Page = 1,
    ///         PerPage = 1,
    ///         Sort = "created_at",
    ///         Order = "desc",
    ///         IncludeTotals = true,
    ///         Fields = "fields",
    ///         Search = "search",
    ///     }
    /// );
    /// </code></example>
    public async Task<IEnumerable<Resource>> ListResourcesAsync(
        ListResourcesRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _query = new Dictionary<string, object>();
        _query["page"] = request.Page.ToString();
        _query["per_page"] = request.PerPage.ToString();
        _query["sort"] = request.Sort;
        _query["order"] = request.Order;
        _query["include_totals"] = JsonUtils.Serialize(request.IncludeTotals);
        if (request.Fields != null)
        {
            _query["fields"] = request.Fields;
        }
        if (request.Search != null)
        {
            _query["search"] = request.Search;
        }
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Get,
                    Path = "/api/resources",
                    Query = _query,
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
                return JsonUtils.Deserialize<IEnumerable<Resource>>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedClientSideParamsException("Failed to deserialize response", e);
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedClientSideParamsApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <summary>
    /// Get a single resource
    /// </summary>
    /// <example><code>
    /// await client.Service.GetResourceAsync(
    ///     "resourceId",
    ///     new GetResourceRequest { IncludeMetadata = true, Format = "json" }
    /// );
    /// </code></example>
    public async Task<Resource> GetResourceAsync(
        string resourceId,
        GetResourceRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _query = new Dictionary<string, object>();
        _query["include_metadata"] = JsonUtils.Serialize(request.IncludeMetadata);
        _query["format"] = request.Format;
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Get,
                    Path = string.Format(
                        "/api/resources/{0}",
                        ValueConvert.ToPathParameterString(resourceId)
                    ),
                    Query = _query,
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
                return JsonUtils.Deserialize<Resource>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedClientSideParamsException("Failed to deserialize response", e);
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedClientSideParamsApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <summary>
    /// Search resources with complex parameters
    /// </summary>
    /// <example><code>
    /// await client.Service.SearchResourcesAsync(
    ///     new SearchResourcesRequest
    ///     {
    ///         Limit = 1,
    ///         Offset = 1,
    ///         Query = "query",
    ///         Filters = new Dictionary&lt;string, object&gt;()
    ///         {
    ///             {
    ///                 "filters",
    ///                 new Dictionary&lt;object, object?&gt;() { { "key", "value" } }
    ///             },
    ///         },
    ///     }
    /// );
    /// </code></example>
    public async Task<SearchResponse> SearchResourcesAsync(
        SearchResourcesRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _query = new Dictionary<string, object>();
        _query["limit"] = request.Limit.ToString();
        _query["offset"] = request.Offset.ToString();
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Post,
                    Path = "/api/resources/search",
                    Body = request,
                    Query = _query,
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
                return JsonUtils.Deserialize<SearchResponse>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedClientSideParamsException("Failed to deserialize response", e);
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedClientSideParamsApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }
}
