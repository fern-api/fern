using System.Net.Http;
using System.Text.Json;
using System.Threading;
using SeedExhaustive;
using SeedExhaustive.Core;
using SeedExhaustive.Types.Object;

namespace SeedExhaustive.Endpoints.Object;

public partial class ObjectClient
{
    private SeedExhaustive.Core.RawClient _client;

    internal ObjectClient(SeedExhaustive.Core.RawClient client)
    {
        _client = client;
    }

    /// <example><code>
    /// await client.Endpoints.Object.GetAndReturnWithOptionalFieldAsync(
    ///     new SeedExhaustive.Types.Object.ObjectWithOptionalField
    ///     {
    ///         String = "test",
    ///         Integer = 21991583578,
    ///         Long = 9223372036854776000,
    ///         Double = 3.14,
    ///         Bool = true,
    ///     }
    /// );
    /// </code></example>
    public async Task<SeedExhaustive.Types.Object.ObjectWithOptionalField> GetAndReturnWithOptionalFieldAsync(
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
                    Method = System.Net.Http.HttpMethod.Post,
                    Path = "/object/get-and-return-with-optional-field",
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
    /// await client.Endpoints.Object.GetAndReturnWithRequiredFieldAsync(
    ///     new SeedExhaustive.Types.Object.ObjectWithRequiredField { String = "string" }
    /// );
    /// </code></example>
    public async Task<SeedExhaustive.Types.Object.ObjectWithRequiredField> GetAndReturnWithRequiredFieldAsync(
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
                    Path = "/object/get-and-return-with-required-field",
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
                return SeedExhaustive.Core.JsonUtils.Deserialize<SeedExhaustive.Types.Object.ObjectWithRequiredField>(
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
    /// await client.Endpoints.Object.GetAndReturnWithMapOfMapAsync(
    ///     new SeedExhaustive.Types.Object.ObjectWithMapOfMap
    ///     {
    ///         Map = new Dictionary&lt;string, Dictionary&lt;string, string&gt;&gt;()
    ///         {
    ///             {
    ///                 "map",
    ///                 new Dictionary&lt;string, string&gt;() { { "map", "map" } }
    ///             },
    ///         },
    ///     }
    /// );
    /// </code></example>
    public async Task<SeedExhaustive.Types.Object.ObjectWithMapOfMap> GetAndReturnWithMapOfMapAsync(
        SeedExhaustive.Types.Object.ObjectWithMapOfMap request,
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
                    Path = "/object/get-and-return-with-map-of-map",
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
                return SeedExhaustive.Core.JsonUtils.Deserialize<SeedExhaustive.Types.Object.ObjectWithMapOfMap>(
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
    /// await client.Endpoints.Object.GetAndReturnNestedWithOptionalFieldAsync(
    ///     new SeedExhaustive.Types.Object.NestedObjectWithOptionalField
    ///     {
    ///         String = "string",
    ///         NestedObject = new SeedExhaustive.Types.Object.ObjectWithOptionalField
    ///         {
    ///             String = "string",
    ///             Integer = 1,
    ///             Long = 1000000,
    ///             Double = 1.1,
    ///             Bool = true,
    ///             Datetime = new DateTime(2024, 01, 15, 09, 30, 00, 000),
    ///             Date = new DateOnly(2023, 1, 15),
    ///             Uuid = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    ///             Base64 = "SGVsbG8gd29ybGQh",
    ///             List = new List&lt;string&gt;() { "list", "list" },
    ///             Set = new HashSet&lt;string&gt;() { "set" },
    ///             Map = new Dictionary&lt;int, string&gt;() { { 1, "map" } },
    ///             Bigint = "1000000",
    ///         },
    ///     }
    /// );
    /// </code></example>
    public async Task<SeedExhaustive.Types.Object.NestedObjectWithOptionalField> GetAndReturnNestedWithOptionalFieldAsync(
        SeedExhaustive.Types.Object.NestedObjectWithOptionalField request,
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
                    Path = "/object/get-and-return-nested-with-optional-field",
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
                return SeedExhaustive.Core.JsonUtils.Deserialize<SeedExhaustive.Types.Object.NestedObjectWithOptionalField>(
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
    /// await client.Endpoints.Object.GetAndReturnNestedWithRequiredFieldAsync(
    ///     "string",
    ///     new SeedExhaustive.Types.Object.NestedObjectWithRequiredField
    ///     {
    ///         String = "string",
    ///         NestedObject = new SeedExhaustive.Types.Object.ObjectWithOptionalField
    ///         {
    ///             String = "string",
    ///             Integer = 1,
    ///             Long = 1000000,
    ///             Double = 1.1,
    ///             Bool = true,
    ///             Datetime = new DateTime(2024, 01, 15, 09, 30, 00, 000),
    ///             Date = new DateOnly(2023, 1, 15),
    ///             Uuid = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    ///             Base64 = "SGVsbG8gd29ybGQh",
    ///             List = new List&lt;string&gt;() { "list", "list" },
    ///             Set = new HashSet&lt;string&gt;() { "set" },
    ///             Map = new Dictionary&lt;int, string&gt;() { { 1, "map" } },
    ///             Bigint = "1000000",
    ///         },
    ///     }
    /// );
    /// </code></example>
    public async Task<SeedExhaustive.Types.Object.NestedObjectWithRequiredField> GetAndReturnNestedWithRequiredFieldAsync(
        string string_,
        SeedExhaustive.Types.Object.NestedObjectWithRequiredField request,
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
                    Path = string.Format(
                        "/object/get-and-return-nested-with-required-field/{0}",
                        SeedExhaustive.Core.ValueConvert.ToPathParameterString(string_)
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
                return SeedExhaustive.Core.JsonUtils.Deserialize<SeedExhaustive.Types.Object.NestedObjectWithRequiredField>(
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
    /// await client.Endpoints.Object.GetAndReturnNestedWithRequiredFieldAsListAsync(
    ///     new List&lt;SeedExhaustive.Types.Object.NestedObjectWithRequiredField&gt;()
    ///     {
    ///         new SeedExhaustive.Types.Object.NestedObjectWithRequiredField
    ///         {
    ///             String = "string",
    ///             NestedObject = new SeedExhaustive.Types.Object.ObjectWithOptionalField
    ///             {
    ///                 String = "string",
    ///                 Integer = 1,
    ///                 Long = 1000000,
    ///                 Double = 1.1,
    ///                 Bool = true,
    ///                 Datetime = new DateTime(2024, 01, 15, 09, 30, 00, 000),
    ///                 Date = new DateOnly(2023, 1, 15),
    ///                 Uuid = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    ///                 Base64 = "SGVsbG8gd29ybGQh",
    ///                 List = new List&lt;string&gt;() { "list", "list" },
    ///                 Set = new HashSet&lt;string&gt;() { "set" },
    ///                 Map = new Dictionary&lt;int, string&gt;() { { 1, "map" } },
    ///                 Bigint = "1000000",
    ///             },
    ///         },
    ///         new SeedExhaustive.Types.Object.NestedObjectWithRequiredField
    ///         {
    ///             String = "string",
    ///             NestedObject = new SeedExhaustive.Types.Object.ObjectWithOptionalField
    ///             {
    ///                 String = "string",
    ///                 Integer = 1,
    ///                 Long = 1000000,
    ///                 Double = 1.1,
    ///                 Bool = true,
    ///                 Datetime = new DateTime(2024, 01, 15, 09, 30, 00, 000),
    ///                 Date = new DateOnly(2023, 1, 15),
    ///                 Uuid = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    ///                 Base64 = "SGVsbG8gd29ybGQh",
    ///                 List = new List&lt;string&gt;() { "list", "list" },
    ///                 Set = new HashSet&lt;string&gt;() { "set" },
    ///                 Map = new Dictionary&lt;int, string&gt;() { { 1, "map" } },
    ///                 Bigint = "1000000",
    ///             },
    ///         },
    ///     }
    /// );
    /// </code></example>
    public async Task<SeedExhaustive.Types.Object.NestedObjectWithRequiredField> GetAndReturnNestedWithRequiredFieldAsListAsync(
        IEnumerable<SeedExhaustive.Types.Object.NestedObjectWithRequiredField> request,
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
                    Path = "/object/get-and-return-nested-with-required-field-list",
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
                return SeedExhaustive.Core.JsonUtils.Deserialize<SeedExhaustive.Types.Object.NestedObjectWithRequiredField>(
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
    /// await client.Endpoints.Object.TestIntegerOverflowEdgeCasesAsync(
    ///     new SeedExhaustive.Types.Object.ObjectWithOptionalField
    ///     {
    ///         String = "boundary-test",
    ///         Integer = 2147483647,
    ///         Long = 9223372036854776000,
    ///         Double = 1.7976931348623157e+308,
    ///         Bool = true,
    ///     }
    /// );
    /// </code></example>
    public async Task<SeedExhaustive.Types.Object.ObjectWithOptionalField> TestIntegerOverflowEdgeCasesAsync(
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
                    Method = System.Net.Http.HttpMethod.Post,
                    Path = "/object/test-integer-overflow-edge-cases",
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
}
