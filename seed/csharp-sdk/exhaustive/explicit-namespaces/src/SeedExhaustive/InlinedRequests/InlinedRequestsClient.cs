using System.Net.Http;
using System.Text.Json;
using System.Threading;
using SeedExhaustive;
using SeedExhaustive.Core;
using SeedExhaustive.GeneralErrors;
using SeedExhaustive.Types.Object;

namespace SeedExhaustive.InlinedRequests;

public partial class InlinedRequestsClient
{
    private SeedExhaustive.Core.RawClient _client;

    internal InlinedRequestsClient(SeedExhaustive.Core.RawClient client)
    {
        _client = client;
    }

    /// <summary>
    /// POST with custom object in request body, response is an object
    /// </summary>
    /// <example><code>
    /// await client.InlinedRequests.PostWithObjectBodyandResponseAsync(
    ///     new SeedExhaustive.InlinedRequests.PostWithObjectBody
    ///     {
    ///         String = "string",
    ///         Integer = 1,
    ///         NestedObject = new SeedExhaustive.Types.Object.ObjectWithOptionalField
    ///         {
    ///             String = "string",
    ///             Integer = 1,
    ///             Long = 1000000,
    ///             Double = 1.1,
    ///             Bool = true,
    ///             Datetime = new DateTime(2024, 01, 15, 09, 30, 00, 000),
    ///             Date = new DateOnly(2023, 1, 15),
    ///             Uuid = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    ///             Base64 = "SGVsbG8gd29ybGQh",
    ///             List = new List&lt;string&gt;() { "list", "list" },
    ///             Set = new HashSet&lt;string&gt;() { "set" },
    ///             Map = new Dictionary&lt;int, string&gt;() { { 1, "map" } },
    ///             Bigint = "1000000",
    ///         },
    ///     }
    /// );
    /// </code></example>
    public async Task<SeedExhaustive.Types.Object.ObjectWithOptionalField> PostWithObjectBodyandResponseAsync(
        SeedExhaustive.InlinedRequests.PostWithObjectBody request,
        SeedExhaustive.RequestOptions? options = null,
        System.Threading.CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new SeedExhaustive.Core.JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = System.Net.Http.HttpMethod.Post,
                    Path = "/req-bodies/object",
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
                return SeedExhaustive.Core.JsonUtils.Deserialize<SeedExhaustive.Types.Object.ObjectWithOptionalField>(
                    responseBody
                )!;
            }
            catch (System.Text.Json.JsonException e)
            {
                throw new SeedExhaustive.SeedExhaustiveException(
                    "Failed to deserialize response",
                    e
                );
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            try
            {
                switch (response.StatusCode)
                {
                    case 400:
                        throw new SeedExhaustive.GeneralErrors.BadRequestBody(
                            SeedExhaustive.Core.JsonUtils.Deserialize<SeedExhaustive.GeneralErrors.BadObjectRequestInfo>(
                                responseBody
                            )
                        );
                }
            }
            catch (System.Text.Json.JsonException)
            {
                // unable to map error response, throwing generic error
            }
            throw new SeedExhaustive.SeedExhaustiveApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }
}
