using System.Net.Http;
using System.Text.Json;
using System.Threading;
using SeedMixedCase.Core;

namespace SeedMixedCase;

public partial class ServiceClient
{
    private RawClient _client;

    internal ServiceClient(RawClient client)
    {
        _client = client;
    }

    /// <example>
    /// <code>
    /// await client.Service.GetResourceAsync("rsc-xyz");
    /// </code>
    /// </example>
    public async Task<object> GetResourceAsync(
        string resourceId,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new RawClient.JsonApiRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Get,
                    Path = $"/resource/{JsonUtils.SerializeAsString(resourceId)}",
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
                return JsonUtils.Deserialize<object>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedMixedCaseException("Failed to deserialize response", e);
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

    /// <example>
    /// <code>
    /// await client.Service.ListResourcesAsync(
    ///     new ListResourcesRequest { PageLimit = 10, BeforeDate = new DateOnly(2023, 1, 1) }
    /// );
    /// </code>
    /// </example>
    public async Task<IEnumerable<object>> ListResourcesAsync(
        ListResourcesRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _query = new Dictionary<string, object>();
        _query["page_limit"] = request.PageLimit.ToString();
        _query["beforeDate"] = request.BeforeDate.ToString(Constants.DateFormat);
        var response = await _client
            .SendRequestAsync(
                new RawClient.JsonApiRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Get,
                    Path = "/resource",
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
                return JsonUtils.Deserialize<IEnumerable<object>>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedMixedCaseException("Failed to deserialize response", e);
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
}
