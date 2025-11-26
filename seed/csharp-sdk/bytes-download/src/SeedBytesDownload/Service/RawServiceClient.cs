using SeedBytesDownload.Core;

namespace SeedBytesDownload;

public partial class RawServiceClient
{
    private RawClient _client;

    internal RawServiceClient(RawClient client)
    {
        _client = client;
    }

    public async Task<RawResponse<object>> SimpleAsync(
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
                    Path = "snippet",
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            return new RawResponse<object>
            {
                Body = null!,
                StatusCode = response.StatusCode,
                Headers = response.Raw.Headers,
            };
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedBytesDownloadApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    public async Task<RawResponse<object>> DownloadAsync(
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
        if (response.StatusCode is >= 200 and < 400)
        {
            throw new SeedBytesDownloadException(
                "Raw response is not supported for bytes endpoints"
            );
        }
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
