using System.Net.Http;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using SeedUnions.Core;

namespace SeedUnions;

public partial class BigunionClient
{
    private RawClient _client;

    internal BigunionClient(RawClient client)
    {
        _client = client;
    }

    /// <example>
    /// <code>
    /// await client.Bigunion.GetAsync("id");
    /// </code>
    /// </example>
    public async Task<object> GetAsync(
        string id,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .MakeRequestAsync(
                new RawClient.JsonApiRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Get,
                    Path = $"/{JsonUtils.SerializeAsString(id)}",
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            try
            {
                return JsonUtils.Deserialize<object>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedUnionsException("Failed to deserialize response", e);
            }
        }

        throw new SeedUnionsApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }

    /// <example>
    /// <code>
    /// await client.Bigunion.UpdateAsync(new NormalSweet { Value = "value" });
    /// </code>
    /// </example>
    public async Task<bool> UpdateAsync(
        object request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .MakeRequestAsync(
                new RawClient.JsonApiRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethodExtensions.Patch,
                    Path = "",
                    Body = request,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            try
            {
                return JsonUtils.Deserialize<bool>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedUnionsException("Failed to deserialize response", e);
            }
        }

        throw new SeedUnionsApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }

    /// <example>
    /// <code>
    /// await client.Bigunion.UpdateManyAsync(
    ///     new List&lt;object&gt;()
    ///     {
    ///         new NormalSweet { Value = "value" },
    ///         new NormalSweet { Value = "value" },
    ///     }
    /// );
    /// </code>
    /// </example>
    public async Task<Dictionary<string, bool>> UpdateManyAsync(
        IEnumerable<object> request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .MakeRequestAsync(
                new RawClient.JsonApiRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethodExtensions.Patch,
                    Path = "/many",
                    Body = request,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            try
            {
                return JsonUtils.Deserialize<Dictionary<string, bool>>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedUnionsException("Failed to deserialize response", e);
            }
        }

        throw new SeedUnionsApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }
}
