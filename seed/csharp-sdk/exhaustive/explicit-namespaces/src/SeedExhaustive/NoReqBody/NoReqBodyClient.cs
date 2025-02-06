using SeedExhaustive.Core;
using System.Threading.Tasks;
using SeedExhaustive.Types.Object;
using SeedExhaustive;
using System.Threading;
using System.Net.Http;
using System.Text.Json;

    namespace SeedExhaustive.NoReqBody;

public partial class NoReqBodyClient
{
    private RawClient _client;
    internal NoReqBodyClient (RawClient client) {
        _client = client;
    }

    /// <example>
    /// <code>
    /// await client.NoReqBody.GetWithNoRequestBodyAsync();
    /// </code>
    /// </example>
    public async Task<ObjectWithOptionalField> GetWithNoRequestBodyAsync(RequestOptions? options = null, CancellationToken cancellationToken = default) {
        var response = await _client.MakeRequestAsync(new RawClient.JsonApiRequest{ 
                BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Get, Path = "/no-req-body", Options = options
            }, cancellationToken).ConfigureAwait(false);
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400) {
            try
            {
                return JsonUtils.Deserialize<ObjectWithOptionalField>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedExhaustiveException("Failed to deserialize response", e);
            }
        }
        
        throw new SeedExhaustiveApiException($"Error with status code {response.StatusCode}", response.StatusCode, responseBody);
    }

    /// <example>
    /// <code>
    /// await client.NoReqBody.PostWithNoRequestBodyAsync();
    /// </code>
    /// </example>
    public async Task<string> PostWithNoRequestBodyAsync(RequestOptions? options = null, CancellationToken cancellationToken = default) {
        var response = await _client.MakeRequestAsync(new RawClient.JsonApiRequest{ 
                BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Post, Path = "/no-req-body", Options = options
            }, cancellationToken).ConfigureAwait(false);
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400) {
            try
            {
                return JsonUtils.Deserialize<string>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedExhaustiveException("Failed to deserialize response", e);
            }
        }
        
        throw new SeedExhaustiveApiException($"Error with status code {response.StatusCode}", response.StatusCode, responseBody);
    }

}
