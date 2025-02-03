using System.Net.Http;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using SeedUnknownAsAny.Core;

namespace SeedUnknownAsAny;

public partial class UnknownClient
{
    private RawClient _client;

    internal UnknownClient(RawClient client)
    {
        _client = client;
    }

    /// <example>
    /// <code>
    /// await client.Unknown.PostAsync(new Dictionary&lt;object, object?&gt;() { { "key", "value" } });
    /// </code>
    /// </example>
    public async Task<IEnumerable<object>> PostAsync(
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
                    Method = HttpMethod.Post,
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
                return JsonUtils.Deserialize<IEnumerable<object>>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedUnknownAsAnyException("Failed to deserialize response", e);
            }
        }

        throw new SeedUnknownAsAnyApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }

    /// <example>
    /// <code>
    /// await client.Unknown.PostObjectAsync(
    ///     new MyObject { Unknown = new Dictionary&lt;object, object?&gt;() { { "key", "value" } } }
    /// );
    /// </code>
    /// </example>
    public async Task<IEnumerable<object>> PostObjectAsync(
        MyObject request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .MakeRequestAsync(
                new RawClient.JsonApiRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Post,
                    Path = "/with-object",
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
                return JsonUtils.Deserialize<IEnumerable<object>>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedUnknownAsAnyException("Failed to deserialize response", e);
            }
        }

        throw new SeedUnknownAsAnyApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }
}
