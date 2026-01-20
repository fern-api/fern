using System.Text.Json;
using SeedTrace.Core;

namespace SeedTrace;

public partial class SubmissionClient : ISubmissionClient
{
    private RawClient _client;

    internal SubmissionClient(RawClient client)
    {
        _client = client;
        Raw = new WithRawResponseClient(_client);
    }

    public SubmissionClient.WithRawResponseClient Raw { get; }

    /// <summary>
    /// Returns sessionId and execution server URL for session. Spins up server.
    /// </summary>
    /// <example><code>
    /// await client.Submission.CreateExecutionSessionAsync(Language.Java);
    /// </code></example>
    public async Task<ExecutionSessionResponse> CreateExecutionSessionAsync(
        Language language,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await Raw.CreateExecutionSessionAsync(language, options, cancellationToken);
        return response.Data;
    }

    /// <summary>
    /// Returns execution server URL for session. Returns empty if session isn't registered.
    /// </summary>
    /// <example><code>
    /// await client.Submission.GetExecutionSessionAsync("sessionId");
    /// </code></example>
    public async Task<ExecutionSessionResponse?> GetExecutionSessionAsync(
        string sessionId,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await Raw.GetExecutionSessionAsync(sessionId, options, cancellationToken);
        return response.Data;
    }

    /// <summary>
    /// Stops execution session.
    /// </summary>
    /// <example><code>
    /// await client.Submission.StopExecutionSessionAsync("sessionId");
    /// </code></example>
    public async Task StopExecutionSessionAsync(
        string sessionId,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        await Raw.StopExecutionSessionAsync(sessionId, options, cancellationToken);
    }

    /// <example><code>
    /// await client.Submission.GetExecutionSessionsStateAsync();
    /// </code></example>
    public async Task<GetExecutionSessionStateResponse> GetExecutionSessionsStateAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await Raw.GetExecutionSessionsStateAsync(options, cancellationToken);
        return response.Data;
    }

    public partial class WithRawResponseClient
    {
        private readonly RawClient _client;

        internal WithRawResponseClient(RawClient client)
        {
            _client = client;
        }

        /// <summary>
        /// Returns sessionId and execution server URL for session. Spins up server.
        /// </summary>
        public async Task<WithRawResponse<ExecutionSessionResponse>> CreateExecutionSessionAsync(
            Language language,
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
                        Path = string.Format(
                            "/sessions/create-session/{0}",
                            ValueConvert.ToPathParameterString(language)
                        ),
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
                    var data = JsonUtils.Deserialize<ExecutionSessionResponse>(responseBody)!;
                    return new WithRawResponse<ExecutionSessionResponse>
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
                    throw new SeedTraceException("Failed to deserialize response", e);
                }
            }

            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                throw new SeedTraceApiException(
                    $"Error with status code {response.StatusCode}",
                    response.StatusCode,
                    responseBody
                );
            }
        }

        /// <summary>
        /// Returns execution server URL for session. Returns empty if session isn't registered.
        /// </summary>
        public async Task<WithRawResponse<ExecutionSessionResponse?>> GetExecutionSessionAsync(
            string sessionId,
            RequestOptions? options = null,
            CancellationToken cancellationToken = default
        )
        {
            var response = await _client
                .SendRequestAsync(
                    new JsonRequest
                    {
                        BaseUrl = _client.Options.BaseUrl,
                        Method = HttpMethod.Get,
                        Path = string.Format(
                            "/sessions/{0}",
                            ValueConvert.ToPathParameterString(sessionId)
                        ),
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
                    var data = JsonUtils.Deserialize<ExecutionSessionResponse?>(responseBody)!;
                    return new WithRawResponse<ExecutionSessionResponse?>
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
                    throw new SeedTraceException("Failed to deserialize response", e);
                }
            }

            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                throw new SeedTraceApiException(
                    $"Error with status code {response.StatusCode}",
                    response.StatusCode,
                    responseBody
                );
            }
        }

        /// <summary>
        /// Stops execution session.
        /// </summary>
        public async Task<WithRawResponse<object>> StopExecutionSessionAsync(
            string sessionId,
            RequestOptions? options = null,
            CancellationToken cancellationToken = default
        )
        {
            var response = await _client
                .SendRequestAsync(
                    new JsonRequest
                    {
                        BaseUrl = _client.Options.BaseUrl,
                        Method = HttpMethod.Delete,
                        Path = string.Format(
                            "/sessions/stop/{0}",
                            ValueConvert.ToPathParameterString(sessionId)
                        ),
                        Options = options,
                    },
                    cancellationToken
                )
                .ConfigureAwait(false);
            if (response.StatusCode is >= 200 and < 400)
            {
                return new WithRawResponse<object>
                {
                    Data = new object(),
                    RawResponse = new RawResponse
                    {
                        StatusCode = (global::System.Net.HttpStatusCode)response.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri!,
                        Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                    },
                };
            }
            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                throw new SeedTraceApiException(
                    $"Error with status code {response.StatusCode}",
                    response.StatusCode,
                    responseBody
                );
            }
        }

        public async Task<
            WithRawResponse<GetExecutionSessionStateResponse>
        > GetExecutionSessionsStateAsync(
            RequestOptions? options = null,
            CancellationToken cancellationToken = default
        )
        {
            var response = await _client
                .SendRequestAsync(
                    new JsonRequest
                    {
                        BaseUrl = _client.Options.BaseUrl,
                        Method = HttpMethod.Get,
                        Path = "/sessions/execution-sessions-state",
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
                    var data = JsonUtils.Deserialize<GetExecutionSessionStateResponse>(
                        responseBody
                    )!;
                    return new WithRawResponse<GetExecutionSessionStateResponse>
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
                    throw new SeedTraceException("Failed to deserialize response", e);
                }
            }

            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                throw new SeedTraceApiException(
                    $"Error with status code {response.StatusCode}",
                    response.StatusCode,
                    responseBody
                );
            }
        }
    }
}
