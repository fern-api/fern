using SeedNurseryApi.Core;

namespace SeedNurseryApi;

public partial class PackageClient : IPackageClient
{
    private RawClient _client;

    internal PackageClient(RawClient client)
    {
        _client = client;
    }

    /// <example><code>
    /// await client.Package.TestAsync(new TestRequest { For = "for" });
    /// </code></example>
    public async Task TestAsync(
        TestRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _queryString = new SeedNurseryApi.Core.QueryStringBuilder.Builder(capacity: 1)
            .Add("for", request.For)
            .MergeAdditional(options?.AdditionalQueryParameters)
            .Build();
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Post,
                    Path = "",
                    QueryString = _queryString,
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
            throw new SeedNurseryApiApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }
}
