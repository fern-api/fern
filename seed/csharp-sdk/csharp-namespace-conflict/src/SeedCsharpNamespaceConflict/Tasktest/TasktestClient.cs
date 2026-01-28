using SeedCsharpNamespaceConflict.Core;

namespace SeedCsharpNamespaceConflict;

public partial class TasktestClient : ITasktestClient
{
    private RawClient _client;

    internal TasktestClient(RawClient client)
    {
        _client = client;
    }

    /// <example><code>
    /// await client.Tasktest.HelloAsync();
    /// </code></example>
    public async System.Threading.Tasks.Task HelloAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedCsharpNamespaceConflict.Core.HeadersBuilder.Builder()
            .AddWithoutAuth(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Get,
                    Path = "hello",
                    Headers = _headers,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedCsharpNamespaceConflictApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }
}
