using System.Net.Http;
using System.Text.Json;
using System.Threading;
using SeedExhaustive;
using SeedExhaustive.Core;
using SeedExhaustive.GeneralErrors;
using SeedExhaustive.Types.Object;

#nullable enable

namespace SeedExhaustive.InlinedRequests;

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
    ///             String = null,
    ///             Integer = null,
    ///             Long = null,
    ///             Double = null,
    ///             Bool = null,
    ///             Datetime = null,
    ///             Date = null,
    ///             Uuid = null,
    ///             Base64 = null,
    ///             List = null,
    ///             Set = null,
    ///             Map = null,
    ///             Bigint = null,
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

        try
        {
            switch (response.StatusCode)
            {
                case 400:
                    throw new BadRequestBody(
                        JsonUtils.Deserialize<BadObjectRequestInfo>(responseBody)
                    );
            }
        }
        catch (JsonException)
        {
            // unable to map error response, throwing generic error
        }
        throw new SeedExhaustiveApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }
}
