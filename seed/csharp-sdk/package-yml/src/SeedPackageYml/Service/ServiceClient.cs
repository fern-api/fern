using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using SeedPackageYml.Core;

namespace SeedPackageYml;

public partial class ServiceClient
{
    private RawClient _client;

    internal ServiceClient(RawClient client)
    {
        _client = client;
    }

    /// <example>
    /// <code>
    /// await client.Service.NopAsync("id-a2ijs82", "id-219xca8");
    /// </code>
    /// </example>
    public async Task NopAsync(
        string id,
        string nestedId,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .MakeRequestAsync(
                new RawClient.JsonApiRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Get,
                    Path = $"/{id}//{nestedId}",
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        throw new SeedPackageYmlApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }
}
