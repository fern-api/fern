using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using SeedApiWideBasePath.Core;

#nullable enable

namespace SeedApiWideBasePath;

public partial class ServiceClient
{
    private RawClient _client;

    internal ServiceClient(RawClient client)
    {
        _client = client;
    }

    /// <example>
    /// <code>
    /// await client.Service.PostAsync("string", "string", "string", 1);
    /// </code>
    /// </example>
    public async Task PostAsync(
        string pathParam,
        string serviceParam,
        string resourceParam,
        int endpointParam,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Post,
                Path = $"/test/{pathParam}/{serviceParam}/{endpointParam}/{resourceParam}",
                Options = options,
            },
            cancellationToken
        );
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        var responseBody = await response.Raw.Content.ReadAsStringAsync(cancellationToken);
        throw new SeedApiWideBasePathApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }
}
