using System.Net.Http;
using System.Text.Json;
using System.Threading;
using SeedExhaustive;
using SeedExhaustive.Core;
using SeedExhaustive.Types.Object;

namespace SeedExhaustive.Endpoints.HttpMethods;

public partial class HttpMethodsClient
{
    private SeedExhaustive.Core.RawClient _client;

    internal HttpMethodsClient(SeedExhaustive.Core.RawClient client)
    {
        _client = client;
    }

    /// <example><code>
    /// await client.Endpoints.HttpMethods.TestGetAsync("id");
    /// </code></example>
    public async Task<string> TestGetAsync(
        string id,
        SeedExhaustive.RequestOptions? options = null,
        System.Threading.CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new SeedExhaustive.Core.JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = System.Net.Http.HttpMethod.Get,
                    Path = string.Format(
                        "/http-methods/{0}",
                        SeedExhaustive.Core.ValueConvert.ToPathParameterString(id)
                    ),
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
                return SeedExhaustive.Core.JsonUtils.Deserialize<string>(responseBody)!;
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

    /// <example><code>
    /// await client.Endpoints.HttpMethods.TestPostAsync(
    ///     new SeedExhaustive.Types.Object.ObjectWithRequiredField { String = "string" }
    /// );
    /// </code></example>
    public async Task<SeedExhaustive.Types.Object.ObjectWithOptionalField> TestPostAsync(
        SeedExhaustive.Types.Object.ObjectWithRequiredField request,
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
                    Path = "/http-methods",
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
                return SeedExhaustive.Core.JsonUtils.Deserialize<SeedExhaustive.Types.Object.ObjectWithOptionalField>(
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

    /// <example><code>
    /// await client.Endpoints.HttpMethods.TestPutAsync(
    ///     "id",
    ///     new SeedExhaustive.Types.Object.ObjectWithRequiredField { String = "string" }
    /// );
    /// </code></example>
    public async Task<SeedExhaustive.Types.Object.ObjectWithOptionalField> TestPutAsync(
        string id,
        SeedExhaustive.Types.Object.ObjectWithRequiredField request,
        SeedExhaustive.RequestOptions? options = null,
        System.Threading.CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new SeedExhaustive.Core.JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = System.Net.Http.HttpMethod.Put,
                    Path = string.Format(
                        "/http-methods/{0}",
                        SeedExhaustive.Core.ValueConvert.ToPathParameterString(id)
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
                return SeedExhaustive.Core.JsonUtils.Deserialize<SeedExhaustive.Types.Object.ObjectWithOptionalField>(
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

    /// <example><code>
    /// await client.Endpoints.HttpMethods.TestPatchAsync(
    ///     "id",
    ///     new SeedExhaustive.Types.Object.ObjectWithOptionalField
    ///     {
    ///         String = "string",
    ///         Integer = 1,
    ///         Long = 1000000,
    ///         Double = 1.1,
    ///         Bool = true,
    ///         Datetime = new DateTime(2024, 01, 15, 09, 30, 00, 000),
    ///         Date = new DateOnly(2023, 1, 15),
    ///         Uuid = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    ///         Base64 = "SGVsbG8gd29ybGQh",
    ///         List = new List&lt;string&gt;() { "list", "list" },
    ///         Set = new HashSet&lt;string&gt;() { "set" },
    ///         Map = new Dictionary&lt;int, string&gt;() { { 1, "map" } },
    ///         Bigint = "1000000",
    ///     }
    /// );
    /// </code></example>
    public async Task<SeedExhaustive.Types.Object.ObjectWithOptionalField> TestPatchAsync(
        string id,
        SeedExhaustive.Types.Object.ObjectWithOptionalField request,
        SeedExhaustive.RequestOptions? options = null,
        System.Threading.CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new SeedExhaustive.Core.JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethodExtensions.Patch,
                    Path = string.Format(
                        "/http-methods/{0}",
                        SeedExhaustive.Core.ValueConvert.ToPathParameterString(id)
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
                return SeedExhaustive.Core.JsonUtils.Deserialize<SeedExhaustive.Types.Object.ObjectWithOptionalField>(
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

    /// <example><code>
    /// await client.Endpoints.HttpMethods.TestDeleteAsync("id");
    /// </code></example>
    public async Task<bool> TestDeleteAsync(
        string id,
        SeedExhaustive.RequestOptions? options = null,
        System.Threading.CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new SeedExhaustive.Core.JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = System.Net.Http.HttpMethod.Delete,
                    Path = string.Format(
                        "/http-methods/{0}",
                        SeedExhaustive.Core.ValueConvert.ToPathParameterString(id)
                    ),
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
            throw new SeedExhaustive.SeedExhaustiveApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }
}
