using System.Net.Http;
using System.Threading;
using global::System.Threading.Tasks;
using SeedFileDownload.Core;

namespace SeedFileDownload;

public partial class ServiceClient
{
    private RawClient _client;

    internal ServiceClient(RawClient client)
    {
        _client = client;
    }

    public async global::System.Threading.Tasks.Task DownloadFileAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new RawClient.JsonApiRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Post,
                    Path = "",
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedFileDownloadApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }
}
