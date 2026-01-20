using System.Text.Json;
using SeedTrace.Core;

namespace SeedTrace;

public partial class MigrationClient : IMigrationClient
{
    private RawClient _client;

    internal MigrationClient(RawClient client)
    {
        _client = client;
        Raw = new WithRawResponseClient(_client);
    }

    public MigrationClient.WithRawResponseClient Raw { get; }

    /// <example><code>
    /// await client.Migration.GetAttemptedMigrationsAsync(
    ///     new GetAttemptedMigrationsRequest { AdminKeyHeader = "admin-key-header" }
    /// );
    /// </code></example>
    public async Task<IEnumerable<Migration>> GetAttemptedMigrationsAsync(
        GetAttemptedMigrationsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await Raw.GetAttemptedMigrationsAsync(request, options, cancellationToken);
        return response.Data;
    }

    public partial class WithRawResponseClient
    {
        private readonly RawClient _client;

        internal WithRawResponseClient(RawClient client)
        {
            _client = client;
        }

        public async Task<WithRawResponse<IEnumerable<Migration>>> GetAttemptedMigrationsAsync(
            GetAttemptedMigrationsRequest request,
            RequestOptions? options = null,
            CancellationToken cancellationToken = default
        )
        {
            var _headers = new Headers(
                new Dictionary<string, string>() { { "admin-key-header", request.AdminKeyHeader } }
            );
            var response = await _client
                .SendRequestAsync(
                    new JsonRequest
                    {
                        BaseUrl = _client.Options.BaseUrl,
                        Method = HttpMethod.Get,
                        Path = "/migration-info/all",
                        Headers = _headers,
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
                    var data = JsonUtils.Deserialize<IEnumerable<Migration>>(responseBody)!;
                    return new WithRawResponse<IEnumerable<Migration>>
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
