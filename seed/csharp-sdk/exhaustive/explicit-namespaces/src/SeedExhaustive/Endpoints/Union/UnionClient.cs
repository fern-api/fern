using System.Net.Http;
using System.Text.Json;
using System.Threading;
using SeedExhaustive;
using SeedExhaustive.Core;
using SeedExhaustive.Types.Union;

namespace SeedExhaustive.Endpoints.Union;

public partial class UnionClient
{
    private SeedExhaustive.Core.RawClient _client;

    internal UnionClient(SeedExhaustive.Core.RawClient client)
    {
        _client = client;
    }

    /// <example><code>
    /// await client.Endpoints.Union.GetAndReturnUnionAsync(
    ///     new SeedExhaustive.Types.Union.Animal(
    ///         new SeedExhaustive.Types.Union.Animal.Dog(
    ///             new SeedExhaustive.Types.Union.Dog { Name = "name", LikesToWoof = true }
    ///         )
    ///     )
    /// );
    /// </code></example>
    public async Task<SeedExhaustive.Types.Union.Animal> GetAndReturnUnionAsync(
        SeedExhaustive.Types.Union.Animal request,
        SeedExhaustive.RequestOptions? options = null,
        System.Threading.CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new SeedExhaustive.Core.JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = System.Net.Http.HttpMethod.Post,
                    Path = "/union",
                    Body = request,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            try
            {
                return SeedExhaustive.Core.JsonUtils.Deserialize<SeedExhaustive.Types.Union.Animal>(
                    responseBody
                )!;
            }
            catch (System.Text.Json.JsonException e)
            {
                throw new SeedExhaustive.SeedExhaustiveException(
                    "Failed to deserialize response",
                    e
                );
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedExhaustive.SeedExhaustiveApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }
}
