using System.Net.Http;
using System.Text.Json;
using System.Threading;
using SeedExhaustive.Core;
using SeedExhaustive.Types;

#nullable enable

namespace SeedExhaustive;

public partial class InlinedRequestsClient
{
    private RawClient _client;

    internal InlinedRequestsClient(RawClient client)
    {
        _client = client;
    }

    /// <summary>
    /// POST with custom object in request body, response is an object
    /// </summary>
    /// <example>
    /// <code>
    /// await client.InlinedRequests.PostWithObjectBodyandResponseAsync(
    ///     new PostWithObjectBody
    ///     {
    ///         String = "string",
    ///         Integer = 1,
    ///         NestedObject = new ObjectWithOptionalField
    ///         {
    ///             String = "string",
    ///             Integer = 1,
    ///             Long = 1000000,
    ///             Double = 1.1,
    ///             Bool = true,
    ///             Datetime = DateTime.Parse(
    ///                 "2024-01-15T09:30:00.000Z",
    ///                 null,
    ///                 DateTimeStyles.AdjustToUniversal
    ///             ),
    ///             Date = new DateOnly(2023, 1, 15),
    ///             Uuid = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    ///             Base64 = "SGVsbG8gd29ybGQh",
    ///             List = new List<string>() { "string" },
    ///             Set = new HashSet<string>() { "string" },
    ///             Map = new Dictionary<int, string>() { { 1, "string" } },
    ///             Bigint = "123456789123456789",
    ///         },
    ///     }
    /// );
    /// </code>
    /// </example>
    public async Task<ObjectWithOptionalField> PostWithObjectBodyandResponseAsync(
        PostWithObjectBody request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Post,
                Path = "/req-bodies/object",
                Body = request,
                Options = options,
            },
            cancellationToken
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            try
            {
                return JsonUtils.Deserialize<ObjectWithOptionalField>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedExhaustiveException("Failed to deserialize response", e);
            }
        }

        throw new SeedExhaustiveApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }
}
