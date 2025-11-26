using SeedStreaming.Core;

namespace SeedStreaming;

public partial class DummyClient
{
    private RawClient _client;

    private RawDummyClient _rawClient;

    internal DummyClient(RawClient client)
    {
        _client = client;
        _rawClient = new RawDummyClient(_client);
        WithRawResponse = _rawClient;
    }

    /// <summary>
    /// Access endpoints with raw HTTP response data (status code, headers).
    /// </summary>
    public RawDummyClient WithRawResponse { get; }

    /// <example><code>
    /// client.Dummy.GenerateStreamAsync(new GenerateStreamRequest { Stream = true, NumEvents = 1 });
    /// </code></example>
    public async IAsyncEnumerable<StreamResponse> GenerateStreamAsync(
        GenerateStreamRequest request,
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
                    Path = "generate-stream",
                    Body = request,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            string? line;
            using var reader = new StreamReader(await response.Raw.Content.ReadAsStreamAsync());
            while (!string.IsNullOrEmpty(line = await reader.ReadLineAsync()))
            {
                StreamResponse? result;
                try
                {
                    result = JsonUtils.Deserialize<StreamResponse>(line);
                }
                catch (System.Text.Json.JsonException)
                {
                    throw new SeedStreamingException($"Unable to deserialize JSON response 'line'");
                }
            }
            yield break;
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedStreamingApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <example><code>
    /// await client.Dummy.GenerateAsync(new Generateequest { Stream = false, NumEvents = 5 });
    /// </code></example>
    public async Task<StreamResponse> GenerateAsync(
        Generateequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return (
            await WithRawResponse
                .GenerateAsync(request, options, cancellationToken)
                .ConfigureAwait(false)
        ).Body;
    }
}
