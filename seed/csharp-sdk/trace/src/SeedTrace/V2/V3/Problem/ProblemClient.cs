using System.Text.Json;
using SeedTrace;
using SeedTrace.Core;

namespace SeedTrace.V2.V3;

public partial class ProblemClient : IProblemClient
{
    private RawClient _client;

    internal ProblemClient(RawClient client)
    {
        _client = client;
        Raw = new WithRawResponseClient(_client);
    }

    public ProblemClient.WithRawResponseClient Raw { get; }

    /// <summary>
    /// Returns lightweight versions of all problems
    /// </summary>
    /// <example><code>
    /// await client.V2.V3.Problem.GetLightweightProblemsAsync();
    /// </code></example>
    public async Task<IEnumerable<LightweightProblemInfoV2>> GetLightweightProblemsAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await Raw.GetLightweightProblemsAsync(options, cancellationToken);
        return response.Data;
    }

    /// <summary>
    /// Returns latest versions of all problems
    /// </summary>
    /// <example><code>
    /// await client.V2.V3.Problem.GetProblemsAsync();
    /// </code></example>
    public async Task<IEnumerable<ProblemInfoV2>> GetProblemsAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await Raw.GetProblemsAsync(options, cancellationToken);
        return response.Data;
    }

    /// <summary>
    /// Returns latest version of a problem
    /// </summary>
    /// <example><code>
    /// await client.V2.V3.Problem.GetLatestProblemAsync("problemId");
    /// </code></example>
    public async Task<ProblemInfoV2> GetLatestProblemAsync(
        string problemId,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await Raw.GetLatestProblemAsync(problemId, options, cancellationToken);
        return response.Data;
    }

    /// <summary>
    /// Returns requested version of a problem
    /// </summary>
    /// <example><code>
    /// await client.V2.V3.Problem.GetProblemVersionAsync("problemId", 1);
    /// </code></example>
    public async Task<ProblemInfoV2> GetProblemVersionAsync(
        string problemId,
        int problemVersion,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await Raw.GetProblemVersionAsync(
            problemId,
            problemVersion,
            options,
            cancellationToken
        );
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
        /// Returns lightweight versions of all problems
        /// </summary>
        public async Task<
            WithRawResponse<IEnumerable<LightweightProblemInfoV2>>
        > GetLightweightProblemsAsync(
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
                        Path = "/problems-v2/lightweight-problem-info",
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
                    var data = JsonUtils.Deserialize<IEnumerable<LightweightProblemInfoV2>>(
                        responseBody
                    )!;
                    return new WithRawResponse<IEnumerable<LightweightProblemInfoV2>>
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
        /// Returns latest versions of all problems
        /// </summary>
        public async Task<WithRawResponse<IEnumerable<ProblemInfoV2>>> GetProblemsAsync(
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
                        Path = "/problems-v2/problem-info",
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
                    var data = JsonUtils.Deserialize<IEnumerable<ProblemInfoV2>>(responseBody)!;
                    return new WithRawResponse<IEnumerable<ProblemInfoV2>>
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
        /// Returns latest version of a problem
        /// </summary>
        public async Task<WithRawResponse<ProblemInfoV2>> GetLatestProblemAsync(
            string problemId,
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
                            "/problems-v2/problem-info/{0}",
                            ValueConvert.ToPathParameterString(problemId)
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
                    var data = JsonUtils.Deserialize<ProblemInfoV2>(responseBody)!;
                    return new WithRawResponse<ProblemInfoV2>
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
        /// Returns requested version of a problem
        /// </summary>
        public async Task<WithRawResponse<ProblemInfoV2>> GetProblemVersionAsync(
            string problemId,
            int problemVersion,
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
                            "/problems-v2/problem-info/{0}/version/{1}",
                            ValueConvert.ToPathParameterString(problemId),
                            ValueConvert.ToPathParameterString(problemVersion)
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
                    var data = JsonUtils.Deserialize<ProblemInfoV2>(responseBody)!;
                    return new WithRawResponse<ProblemInfoV2>
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
