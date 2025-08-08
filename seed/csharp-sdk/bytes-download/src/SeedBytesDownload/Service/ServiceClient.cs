using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using SeedBytesDownload.Core;

namespace SeedBytesDownload;

public partial class ServiceClient
{
    private RawClient _client;

    internal ServiceClient(RawClient client)
    {
        _client = client;
    }

    public async Task DownloadAsync(
        string id,
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
                        "download-content/{0}",
                        ValueConvert.ToPathParameterString(id)
                    ),
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedBytesDownloadApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }
}
