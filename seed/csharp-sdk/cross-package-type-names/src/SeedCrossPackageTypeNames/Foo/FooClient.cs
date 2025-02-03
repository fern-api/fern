using System.Net.Http;
using System.Text.Json;
using System.Threading;
using SeedCrossPackageTypeNames.Core;

namespace SeedCrossPackageTypeNames;

public partial class FooClient
{
    private RawClient _client;

    internal FooClient(RawClient client)
    {
        _client = client;
    }

    /// <example>
    /// <code>
    /// await client.Foo.FindAsync(
    ///     new FindRequest
    ///     {
    ///         OptionalString = "optionalString",
    ///         PublicProperty = "publicProperty",
    ///         PrivateProperty = 1,
    ///     }
    /// );
    /// </code>
    /// </example>
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
        var requestBody = new Dictionary<string, object>()
        {
            { "publicProperty", request.PublicProperty },
            { "privateProperty", request.PrivateProperty },
        };
        var response = await _client
            .MakeRequestAsync(
                new RawClient.JsonApiRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Post,
                    Path = "",
                    Body = requestBody,
                    Query = _query,
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
                return JsonUtils.Deserialize<ImportingType>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedCrossPackageTypeNamesException("Failed to deserialize response", e);
            }
        }

        throw new SeedCrossPackageTypeNamesApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }
}
