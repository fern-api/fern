using System.Text.Json;
using SeedUnions.Core;

namespace SeedUnions;

public partial class BigunionClient
{
    private RawClient _client;

    internal BigunionClient(RawClient client)
    {
        _client = client;
    }

    /// <example><code>
    /// await client.Bigunion.GetAsync("id");
    /// </code></example>
    public async Task<BigUnion> GetAsync(
        string id,
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
                    Path = string.Format("/{0}", ValueConvert.ToPathParameterString(id)),
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
                return JsonUtils.Deserialize<BigUnion>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedUnionsException("Failed to deserialize response", e);
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedUnionsApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <example><code>
    /// await client.Bigunion.UpdateAsync(
    ///     new BigUnion(new BigUnion.NormalSweet(new NormalSweet { Value = "value" }))
    /// );
    /// </code></example>
    public async Task<bool> UpdateAsync(
        BigUnion request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
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
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            try
            {
                return JsonUtils.Deserialize<bool>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedUnionsException("Failed to deserialize response", e);
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedUnionsApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <example><code>
    /// await client.Bigunion.UpdateManyAsync(
    ///     new List&lt;BigUnion&gt;()
    ///     {
    ///         new BigUnion(new BigUnion.NormalSweet(new NormalSweet { Value = "value" })),
    ///         new BigUnion(new BigUnion.NormalSweet(new NormalSweet { Value = "value" })),
    ///     }
    /// );
    /// </code></example>
    public async Task<Dictionary<string, bool>> UpdateManyAsync(
        IEnumerable<BigUnion> request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
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
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            try
            {
                return JsonUtils.Deserialize<Dictionary<string, bool>>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedUnionsException("Failed to deserialize response", e);
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedUnionsApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }
}
