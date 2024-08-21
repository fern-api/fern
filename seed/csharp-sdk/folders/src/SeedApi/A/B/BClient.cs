using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using SeedApi;
using SeedApi.Core;

#nullable enable

namespace SeedApi.A.B;

public partial class BClient
{
    private RawClient _client;

    internal BClient(RawClient client)
    {
        _client = client;
    }

    public async Task FooAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Post,
                Path = "",
                Options = options,
            },
            cancellationToken
        );
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        throw new SeedApiApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }
}
