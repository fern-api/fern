using System.Net.Http;
using System.Text.Json;
using System.Threading;
using SeedExhaustive;
using SeedExhaustive.Core;
using SeedExhaustive.GeneralErrors;

namespace SeedExhaustive.NoAuth;

public partial class NoAuthClient
{
    private SeedExhaustive.Core.RawClient _client;

    internal NoAuthClient(SeedExhaustive.Core.RawClient client)
    {
        _client = client;
    }

    /// <summary>
    /// POST request with no auth
    /// </summary>
    /// <example><code>
    /// await client.NoAuth.PostWithNoAuthAsync(new Dictionary&lt;object, object?&gt;() { { "key", "value" } });
    /// </code></example>
    public async Task<bool> PostWithNoAuthAsync(
        object request,
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
                    Path = "/no-auth",
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
                return SeedExhaustive.Core.JsonUtils.Deserialize<bool>(responseBody)!;
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
            try
            {
                switch (response.StatusCode)
                {
                    case 400:
                        throw new SeedExhaustive.GeneralErrors.BadRequestBody(
                            SeedExhaustive.Core.JsonUtils.Deserialize<SeedExhaustive.GeneralErrors.BadObjectRequestInfo>(
                                responseBody
                            )
                        );
                }
            }
            catch (System.Text.Json.JsonException)
            {
                // unable to map error response, throwing generic error
            }
            throw new SeedExhaustive.SeedExhaustiveApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }
}
