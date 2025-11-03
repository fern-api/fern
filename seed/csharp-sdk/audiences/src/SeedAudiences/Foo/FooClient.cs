using System.Text.Json;
using SeedAudiences.Core;

namespace SeedAudiences;

public partial class FooClient
{
    private RawClient _client;

    internal FooClient(RawClient client)
    {
        _client = client;
    }

    /// <example><code>
    /// await client.Foo.FindAsync(
    ///     new FindRequest
    ///     {
    ///         OptionalString = "optionalString",
    ///         PublicProperty = "publicProperty",
    ///         PrivateProperty = 1,
    ///     }
    /// );
    /// </code></example>
    public async Task<ImportingType> FindAsync(
        FindRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _query = new Dictionary<string, object>();
        if (request.OptionalString != null)
        {
            _query["optionalString"] = request.OptionalString;
        }
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Post,
                    Path = "",
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
                return JsonUtils.Deserialize<ImportingType>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedAudiencesException("Failed to deserialize response", e);
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedAudiencesApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }
}
