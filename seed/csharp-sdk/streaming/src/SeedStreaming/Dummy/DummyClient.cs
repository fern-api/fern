using System.Text.Json;
using SeedStreaming.Core;

namespace SeedStreaming;

public partial class DummyClient : IDummyClient
{
    private RawClient _client;

    internal DummyClient(RawClient client)
    {
        _client = client;
        Raw = new WithRawResponseClient(_client);
    }

    public DummyClient.WithRawResponseClient Raw { get; }

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

    /// <example><code>
    /// await client.Dummy.GenerateAsync(new Generateequest { Stream = false, NumEvents = 5 });
    /// </code></example>
    public async Task<StreamResponse> GenerateAsync(
        Generateequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await Raw.GenerateAsync(request, options, cancellationToken);
        return response.Data;
    }

    public partial class WithRawResponseClient
    {
        private readonly RawClient _client;

        internal WithRawResponseClient(RawClient client)
        {
            _client = client;
        }

        public async Task<WithRawResponse<IAsyncEnumerable<StreamResponse>>> GenerateStreamAsync(
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
                var rawResponse = new RawResponse
                {
                    StatusCode = (global::System.Net.HttpStatusCode)response.StatusCode,
                    Url = response.Raw.RequestMessage?.RequestUri!,
                    Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                };

                return new WithRawResponse<IAsyncEnumerable<StreamResponse>>
                {
                    Data = StreamDataAsync(),
                    RawResponse = rawResponse,
                };

                async IAsyncEnumerable<StreamResponse> StreamDataAsync()
                {
                    string? line;
                    using var reader = new StreamReader(
                        await response.Raw.Content.ReadAsStreamAsync()
                    );
                    while (!string.IsNullOrEmpty(line = await reader.ReadLineAsync()))
                    {
                        StreamResponse? result;
                        try
                        {
                            result = JsonUtils.Deserialize<StreamResponse>(line);
                        }
                        catch (System.Text.Json.JsonException)
                        {
                            throw new SeedStreamingException(
                                $"Unable to deserialize JSON response 'line'"
                            );
                        }
                        yield return result!;
                    }
                    yield break;
                }
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

        public async Task<WithRawResponse<StreamResponse>> GenerateAsync(
            Generateequest request,
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
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                try
                {
                    var data = JsonUtils.Deserialize<StreamResponse>(responseBody)!;
                    return new WithRawResponse<StreamResponse>
                    {
                        Data = data,
                        RawResponse = new RawResponse
                        {
                            StatusCode = (global::System.Net.HttpStatusCode)response.StatusCode,
                            Url = response.Raw.RequestMessage?.RequestUri!,
                            Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                        },
                    };
                }
                catch (JsonException e)
                {
                    throw new SeedStreamingException("Failed to deserialize response", e);
                }
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
    }
}
