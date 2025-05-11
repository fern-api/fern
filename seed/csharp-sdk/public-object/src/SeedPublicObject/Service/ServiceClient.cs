using System.Net.Http;
using System.Threading;
using global::System.Threading.Tasks;
using SeedPublicObject.Core;

namespace SeedPublicObject;

public partial class ServiceClient
{
    private RawClient _client;

    internal ServiceClient(RawClient client)
    {
        _client = client;
    }

    public async global::System.Threading.Tasks.Task GetAsync(
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
                    Path = "/helloworld.txt",
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedPublicObjectApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }
}
