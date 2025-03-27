using System.Threading;
using global::System.Threading.Tasks;
using SeedContentTypes.Core;

namespace SeedContentTypes;

public partial class ServiceClient
{
    private RawClient _client;

    internal ServiceClient(RawClient client)
    {
        _client = client;
    }

    /// <example><code>
    /// await client.Service.PatchAsync(
    ///     new PatchProxyRequest { Application = "application", RequireAuth = true }
    /// );
    /// </code></example>
    public async global::System.Threading.Tasks.Task PatchAsync(
        PatchProxyRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethodExtensions.Patch,
                    Path = "",
                    Body = request,
                    ContentType = "application/merge-patch+json",
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
            throw new SeedContentTypesApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }
}
