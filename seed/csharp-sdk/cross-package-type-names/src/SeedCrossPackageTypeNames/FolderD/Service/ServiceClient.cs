using System.Net.Http;
using System.Text.Json;
using System.Threading;
using SeedCrossPackageTypeNames;
using SeedCrossPackageTypeNames.Core;

namespace SeedCrossPackageTypeNames.FolderD;

public partial class ServiceClient
{
    private RawClient _client;

    internal ServiceClient(RawClient client)
    {
        _client = client;
    }

    /// <example>
    /// <code>
    /// await client.FolderD.Service.GetDirectThreadAsync();
    /// </code>
    /// </example>
    public async Task<Response> GetDirectThreadAsync(
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
                    Path = "",
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            try
            {
                return JsonUtils.Deserialize<Response>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedCrossPackageTypeNamesException("Failed to deserialize response", e);
            }
        }

        throw new SeedCrossPackageTypeNamesApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }
}
