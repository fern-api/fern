using System.Text.Json;
using SeedLiteral.Core;

namespace SeedLiteral;

public partial class QueryClient
{
    private RawClient _client;

    internal QueryClient(RawClient client)
    {
        _client = client;
    }

    /// <example><code>
    /// await client.Query.SendAsync(
    ///     new SendLiteralsInQueryRequest
    ///     {
    ///         Prompt = "You are a helpful assistant",
    ///         OptionalPrompt = "You are a helpful assistant",
    ///         AliasPrompt = "You are a helpful assistant",
    ///         AliasOptionalPrompt = "You are a helpful assistant",
    ///         Stream = false,
    ///         OptionalStream = false,
    ///         AliasStream = false,
    ///         AliasOptionalStream = false,
    ///         Query = "What is the weather today",
    ///     }
    /// );
    /// </code></example>
    public async Task<SendResponse> SendAsync(
        SendLiteralsInQueryRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _query = new Dictionary<string, object>();
        _query["prompt"] = request.Prompt.ToString();
        _query["alias_prompt"] = request.AliasPrompt.ToString();
        _query["query"] = request.Query;
        _query["stream"] = JsonUtils.Serialize(request.Stream);
        _query["alias_stream"] = JsonUtils.Serialize(request.AliasStream);
        if (request.OptionalPrompt != null)
        {
            _query["optional_prompt"] = request.OptionalPrompt.ToString();
        }
        if (request.AliasOptionalPrompt != null)
        {
            _query["alias_optional_prompt"] = request.AliasOptionalPrompt.ToString();
        }
        if (request.OptionalStream != null)
        {
            _query["optional_stream"] = JsonUtils.Serialize(request.OptionalStream.Value);
        }
        if (request.AliasOptionalStream != null)
        {
            _query["alias_optional_stream"] = JsonUtils.Serialize(
                request.AliasOptionalStream.Value
            );
        }
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Post,
                    Path = "query",
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
                return JsonUtils.Deserialize<SendResponse>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedLiteralException("Failed to deserialize response", e);
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedLiteralApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }
}
