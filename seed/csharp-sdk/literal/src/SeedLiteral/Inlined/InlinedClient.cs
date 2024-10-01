using System.Net.Http;
using System.Text.Json;
using System.Threading;
using SeedLiteral.Core;

#nullable enable

namespace SeedLiteral;

public partial class InlinedClient
{
    private RawClient _client;

    internal InlinedClient(RawClient client)
    {
        _client = client;
    }

    /// <example>
    /// <code>
    /// await client.Inlined.SendAsync(
    ///     new SendLiteralsInlinedRequest
    ///     {
    ///         Temperature = 10.1,
    ///         Prompt = &quot;You are a helpful assistant&quot;,
    ///         Context = &quot;You&#39;re super wise&quot;,
    ///         AliasedContext = &quot;You&#39;re super wise&quot;,
    ///         MaybeContext = &quot;You&#39;re super wise&quot;,
    ///         ObjectWithLiteral = new ATopLevelLiteral
    ///         {
    ///             NestedLiteral = new ANestedLiteral { MyLiteral = &quot;How super cool&quot; },
    ///         },
    ///         Stream = false,
    ///         Query = &quot;What is the weather today&quot;,
    ///     }
    /// );
    /// </code>
    /// </example>
    public async Task<SendResponse> SendAsync(
        SendLiteralsInlinedRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Post,
                Path = "inlined",
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
                return JsonUtils.Deserialize<SendResponse>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedLiteralException("Failed to deserialize response", e);
            }
        }

        throw new SeedLiteralApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }
}
