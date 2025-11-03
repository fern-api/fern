using SeedExhaustive;
using SeedExhaustive.Core;
using SeedExhaustive.Types;

namespace SeedExhaustive.Endpoints;

public partial class ContentTypeClient
{
    private RawClient _client;

    internal ContentTypeClient(RawClient client)
    {
        _client = client;
    }

    /// <example><code>
    /// await client.Endpoints.ContentType.PostJsonPatchContentTypeAsync(
    ///     new ObjectWithOptionalField
    ///     {
    ///         String = "string",
    ///         Integer = 1,
    ///         Long = 1000000,
    ///         Double = 1.1,
    ///         Bool = true,
    ///         Datetime = new DateTime(2024, 01, 15, 09, 30, 00, 000),
    ///         Date = new DateOnly(2023, 1, 15),
    ///         Uuid = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    ///         Base64 = "SGVsbG8gd29ybGQh",
    ///         List = new List&lt;string&gt;() { "list", "list" },
    ///         Set = new HashSet&lt;string&gt;() { "set" },
    ///         Map = new Dictionary&lt;int, string&gt;() { { 1, "map" } },
    ///         Bigint = "1000000",
    ///     }
    /// );
    /// </code></example>
    public async Task PostJsonPatchContentTypeAsync(
        ObjectWithOptionalField request,
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
                    Path = "/foo/bar",
                    Body = request,
                    ContentType = "application/json-patch+json",
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedExhaustiveApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <example><code>
    /// await client.Endpoints.ContentType.PostJsonPatchContentWithCharsetTypeAsync(
    ///     new ObjectWithOptionalField
    ///     {
    ///         String = "string",
    ///         Integer = 1,
    ///         Long = 1000000,
    ///         Double = 1.1,
    ///         Bool = true,
    ///         Datetime = new DateTime(2024, 01, 15, 09, 30, 00, 000),
    ///         Date = new DateOnly(2023, 1, 15),
    ///         Uuid = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    ///         Base64 = "SGVsbG8gd29ybGQh",
    ///         List = new List&lt;string&gt;() { "list", "list" },
    ///         Set = new HashSet&lt;string&gt;() { "set" },
    ///         Map = new Dictionary&lt;int, string&gt;() { { 1, "map" } },
    ///         Bigint = "1000000",
    ///     }
    /// );
    /// </code></example>
    public async Task PostJsonPatchContentWithCharsetTypeAsync(
        ObjectWithOptionalField request,
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
                    Path = "/foo/baz",
                    Body = request,
                    ContentType = "application/json-patch+json; charset=utf-8",
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedExhaustiveApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }
}
