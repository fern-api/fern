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

    /// <example><code>
    /// await client.Optional.SendOptionalTypedBodyAsync(
    ///     new SendOptionalBodyRequest { Message = "message" }
    /// );
    /// </code></example>
    public async Task<string> SendOptionalTypedBodyAsync(
        SendOptionalBodyRequest? request,
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
                    Path = "send-optional-typed-body",
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

    /// <summary>
    /// Tests optional(nullable(T)) where T has only optional properties.
    /// This should not generate wire tests expecting {} when Optional.empty() is passed.
    /// </summary>
    /// <example><code>
    /// await client.Optional.SendOptionalNullableWithAllOptionalPropertiesAsync(
    ///     "actionId",
    ///     "id",
    ///     new DeployParams { UpdateDraft = true }
    /// );
    /// </code></example>
    public async Task<DeployResponse> SendOptionalNullableWithAllOptionalPropertiesAsync(
        string actionId,
        string id,
        DeployParams? request,
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
                    Path = string.Format(
                        "deploy/{0}/versions/{1}",
                        ValueConvert.ToPathParameterString(actionId),
                        ValueConvert.ToPathParameterString(id)
                    ),
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
                return JsonUtils.Deserialize<DeployResponse>(responseBody)!;
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
