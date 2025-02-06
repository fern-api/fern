using System.Net.Http;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using SeedStreaming.Core;

namespace SeedStreaming;

public partial class DummyClient
{
    private RawClient _client;

    internal DummyClient(RawClient client)
    {
        _client = client;
    }

    /// <example>
    /// <code>
    /// await client.Dummy.GenerateStreamAsync(new GenerateStreamRequest { Stream = true, NumEvents = 1 });
    /// </code>
    /// </example>
    public async Task GenerateStreamAsync(
        GenerateStreamRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .MakeRequestAsync(
                new RawClient.JsonApiRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Post,
                    Path = "generate-stream",
                    Body = request,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        throw new SeedStreamingApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }

    /// <example>
    /// <code>
    /// await client.Dummy.GenerateAsync(new Generateequest { Stream = false, NumEvents = 5 });
    /// </code>
    /// </example>
    public async Task<StreamResponse> GenerateAsync(
        Generateequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .MakeRequestAsync(
                new RawClient.JsonApiRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Post,
                    Path = "generate",
                    Body = request,
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
                return JsonUtils.Deserialize<StreamResponse>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedStreamingException("Failed to deserialize response", e);
            }
        }

        throw new SeedStreamingApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }
}
