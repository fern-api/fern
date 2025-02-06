using SeedLiteral.Core;
using System.Threading.Tasks;
using System.Threading;
using System.Net.Http;
using System.Text.Json;

    namespace SeedLiteral;

public partial class ReferenceClient
{
    private RawClient _client;
    internal ReferenceClient (RawClient client) {
        _client = client;
    }

    /// <example>
    /// <code>
    /// await client.Reference.SendAsync(
    ///     new SendRequest
    ///     {
    ///         Prompt = "You are a helpful assistant",
    ///         Stream = false,
    ///         Context = "You're super wise",
    ///         Query = "What is the weather today",
    ///         ContainerObject = new ContainerObject
    ///         {
    ///             NestedObjects = new List&lt;NestedObjectWithLiterals&gt;()
    ///             {
    ///                 new NestedObjectWithLiterals
    ///                 {
    ///                     Literal1 = "literal1",
    ///                     Literal2 = "literal2",
    ///                     StrProp = "strProp",
    ///                 },
    ///             },
    ///         },
    ///     }
    /// );
    /// </code>
    /// </example>
    public async Task<SendResponse> SendAsync(SendRequest request, RequestOptions? options = null, CancellationToken cancellationToken = default) {
        var response = await _client.MakeRequestAsync(new RawClient.JsonApiRequest{ 
                BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Post, Path = "reference", Body = request, Options = options
            }, cancellationToken).ConfigureAwait(false);
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400) {
            try
            {
                return JsonUtils.Deserialize<SendResponse>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedLiteralException("Failed to deserialize response", e);
            }
        }
        
        throw new SeedLiteralApiException($"Error with status code {response.StatusCode}", response.StatusCode, responseBody);
    }

}
