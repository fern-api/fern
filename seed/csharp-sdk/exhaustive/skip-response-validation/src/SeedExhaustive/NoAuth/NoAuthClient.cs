using System.Net.Http;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using SeedExhaustive.Core;

namespace SeedExhaustive;

public partial class NoAuthClient
{
    private RawClient _client;

    internal NoAuthClient(RawClient client)
    {
        _client = client;
    }

    /// <summary>
    /// POST request with no auth
    /// </summary>
    /// <example>
    /// <code>
    /// await client.NoAuth.PostWithNoAuthAsync(new Dictionary&lt;object, object?&gt;() { { "key", "value" } });
    /// </code>
    /// </example>
    public async Task<bool> PostWithNoAuthAsync(
        object request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .MakeRequestAsync(
                new RawClient.JsonApiRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Post,
                    Path = "/no-auth",
                    Body = request,
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
                return JsonUtils.DeserializeWithFallback<bool>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedExhaustiveException("Failed to deserialize response", e);
            }
        }

        try
        {
            switch (response.StatusCode)
            {
                case 400:
                    throw new BadRequestBody(
                        JsonUtils.DeserializeWithFallback<BadObjectRequestInfo>(responseBody)
                    );
            }
        }
        catch (JsonException)
        {
            // unable to map error response, throwing generic error
        }
        throw new SeedExhaustiveApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }
}
