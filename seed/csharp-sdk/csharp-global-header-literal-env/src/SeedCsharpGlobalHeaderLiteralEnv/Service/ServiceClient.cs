using global::System.Text.Json;
using SeedCsharpGlobalHeaderLiteralEnv.Core;

namespace SeedCsharpGlobalHeaderLiteralEnv;

public partial class ServiceClient : IServiceClient
{
    private readonly RawClient _client;

    internal ServiceClient(RawClient client)
    {
        _client = client;
    }

    private async Task<WithRawResponse<string>> GetWithLiteralVersionHeaderAsyncCore(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _queryString = new SeedCsharpGlobalHeaderLiteralEnv.Core.QueryStringBuilder.Builder(
            capacity: 0
        )
            .MergeAdditional(options?.AdditionalQueryParameters)
            .Build();
        var _headers = await new SeedCsharpGlobalHeaderLiteralEnv.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    Method = HttpMethod.Get,
                    Path = "version",
                    QueryString = _queryString,
                    Headers = _headers,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            try
            {
                var responseData = JsonUtils.Deserialize<string>(responseBody)!;
                return new WithRawResponse<string>()
                {
                    Data = responseData,
                    RawResponse = new SeedCsharpGlobalHeaderLiteralEnv.RawResponse()
                    {
                        StatusCode = response.Raw.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                        Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                    },
                };
            }
            catch (JsonException e)
            {
                throw new SeedCsharpGlobalHeaderLiteralEnvApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e,
                    rawResponse: new SeedCsharpGlobalHeaderLiteralEnv.RawResponse()
                    {
                        StatusCode = response.Raw.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                        Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                    }
                );
            }
        }
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            throw new SeedCsharpGlobalHeaderLiteralEnvApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody,
                rawResponse: new SeedCsharpGlobalHeaderLiteralEnv.RawResponse()
                {
                    StatusCode = response.Raw.StatusCode,
                    Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                    Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                }
            );
        }
    }

    /// <summary>
    /// GET request with a literal version header
    /// </summary>
    /// <example><code>
    /// await client.Service.GetWithLiteralVersionHeaderAsync();
    /// </code></example>
    public WithRawResponseTask<string> GetWithLiteralVersionHeaderAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<string>(
            GetWithLiteralVersionHeaderAsyncCore(options, cancellationToken)
        );
    }
}
