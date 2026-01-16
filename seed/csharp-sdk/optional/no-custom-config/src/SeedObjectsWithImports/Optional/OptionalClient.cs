using System.Text.Json;
using SeedObjectsWithImports.Core;

namespace SeedObjectsWithImports;

public partial class OptionalClient : IOptionalClient
{
    private RawClient _client;

    internal OptionalClient(RawClient client)
    {
        _client = client;
        Raw = new RawAccessClient(_client);
    }

    public OptionalClient.RawAccessClient Raw { get; }

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
        Dictionary<string, object?>? request,
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

    public partial class RawAccessClient
    {
        private readonly RawClient _client;

        internal RawAccessClient(RawClient client)
        {
            _client = client;
        }

        private static IReadOnlyDictionary<string, IEnumerable<string>> ExtractHeaders(
            HttpResponseMessage response
        )
        {
            var headers = new Dictionary<string, IEnumerable<string>>(
                StringComparer.OrdinalIgnoreCase
            );
            foreach (var header in response.Headers)
            {
                headers[header.Key] = header.Value.ToList();
            }
            if (response.Content != null)
            {
                foreach (var header in response.Content.Headers)
                {
                    headers[header.Key] = header.Value.ToList();
                }
            }
            return headers;
        }

        public async Task<RawResponse<string>> SendOptionalBodyAsync(
            Dictionary<string, object?>? request,
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
                    var body = JsonUtils.Deserialize<string>(responseBody)!;
                    return new RawResponse<string>
                    {
                        StatusCode = (System.Net.HttpStatusCode)response.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri!,
                        Headers = ExtractHeaders(response.Raw),
                        Body = body,
                    };
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

        public async Task<RawResponse<string>> SendOptionalTypedBodyAsync(
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
                    var body = JsonUtils.Deserialize<string>(responseBody)!;
                    return new RawResponse<string>
                    {
                        StatusCode = (System.Net.HttpStatusCode)response.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri!,
                        Headers = ExtractHeaders(response.Raw),
                        Body = body,
                    };
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
        public async Task<
            RawResponse<DeployResponse>
        > SendOptionalNullableWithAllOptionalPropertiesAsync(
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
                    var body = JsonUtils.Deserialize<DeployResponse>(responseBody)!;
                    return new RawResponse<DeployResponse>
                    {
                        StatusCode = (System.Net.HttpStatusCode)response.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri!,
                        Headers = ExtractHeaders(response.Raw),
                        Body = body,
                    };
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
}
