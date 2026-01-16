using SeedStreaming.Core;

namespace SeedStreaming;

public partial class DummyClient : IDummyClient
{
    private RawClient _client;

    internal DummyClient(RawClient client)
    {
        _client = client;
        Raw = new RawAccessClient(_client);
    }

    public DummyClient.RawAccessClient Raw { get; }

    /// <example><code>
    /// client.Dummy.GenerateAsync(new GenerateRequest { Stream = false, NumEvents = 5 });
    /// </code></example>
    public async IAsyncEnumerable<StreamResponse> GenerateAsync(
        GenerateRequest request,
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
                    Path = "generate",
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
                yield return result!;
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

    public partial class RawAccessClient
    {
        private readonly RawClient _client;

        internal RawAccessClient(RawClient client)
        {
            _client = client;
        }

        public async Task<WithRawResponse<IAsyncEnumerable<StreamResponse>>> GenerateAsync(
            GenerateRequest request,
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
                        Path = "generate",
                        Body = request,
                        Options = options,
                    },
                    cancellationToken
                )
                .ConfigureAwait(false);
            // Streaming responses are not supported for raw access
            throw new SeedStreamingException(
                "Streaming responses are not supported for raw access"
            );
            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                throw new SeedStreamingApiException(
                    $"Error with status code {response.StatusCode}",
                    response.StatusCode,
                    responseBody
                );
            }
        }
    }
}
