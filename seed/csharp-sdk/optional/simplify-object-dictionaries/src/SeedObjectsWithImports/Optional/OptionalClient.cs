using System.Text.Json;
using SeedObjectsWithImports.Core;

namespace SeedObjectsWithImports;

public partial class OptionalClient
{
    private RawClient _client;

    internal OptionalClient(RawClient client)
    {
        _client = client;
    }

    /// <example><code>
    /// await client.Optional.SendOptionalBodyAsync(
    ///     new Dictionary&lt;string, object?&gt;()
    ///     {
    ///         {
    ///             "string",
    ///             new Dictionary&lt;object, object?&gt;() { { "key", "value" } }
    ///         },
    ///     }
    /// );
    /// </code></example>
    public async Task<string> SendOptionalBodyAsync(
        object? request,
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
                    Path = "send-optional-body",
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
                return JsonUtils.Deserialize<string>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedObjectsWithImportsException("Failed to deserialize response", e);
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedObjectsWithImportsApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }
}
