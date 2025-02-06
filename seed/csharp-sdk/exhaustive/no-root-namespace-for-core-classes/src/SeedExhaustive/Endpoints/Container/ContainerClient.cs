using System.Net.Http;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using SeedExhaustive.Core;
using SeedExhaustive.Types;

namespace SeedExhaustive.Endpoints;

public partial class ContainerClient
{
    private RawClient _client;

    internal ContainerClient(RawClient client)
    {
        _client = client;
    }

    /// <example>
    /// <code>
    /// await client.Endpoints.Container.GetAndReturnListOfPrimitivesAsync(
    ///     new List&lt;string&gt;() { "string", "string" }
    /// );
    /// </code>
    /// </example>
    public async Task<IEnumerable<string>> GetAndReturnListOfPrimitivesAsync(
        IEnumerable<string> request,
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
                    Path = "/container/list-of-primitives",
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
                return JsonUtils.Deserialize<IEnumerable<string>>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedExhaustiveException("Failed to deserialize response", e);
            }
        }

        throw new SeedExhaustiveApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }

    /// <example>
    /// <code>
    /// await client.Endpoints.Container.GetAndReturnListOfObjectsAsync(
    ///     new List&lt;ObjectWithRequiredField&gt;()
    ///     {
    ///         new ObjectWithRequiredField { String = "string" },
    ///         new ObjectWithRequiredField { String = "string" },
    ///     }
    /// );
    /// </code>
    /// </example>
    public async Task<IEnumerable<ObjectWithRequiredField>> GetAndReturnListOfObjectsAsync(
        IEnumerable<ObjectWithRequiredField> request,
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
                    Path = "/container/list-of-objects",
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
                return JsonUtils.Deserialize<IEnumerable<ObjectWithRequiredField>>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedExhaustiveException("Failed to deserialize response", e);
            }
        }

        throw new SeedExhaustiveApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }

    /// <example>
    /// <code>
    /// await client.Endpoints.Container.GetAndReturnSetOfPrimitivesAsync(
    ///     new HashSet&lt;string&gt;() { "string" }
    /// );
    /// </code>
    /// </example>
    public async Task<HashSet<string>> GetAndReturnSetOfPrimitivesAsync(
        HashSet<string> request,
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
                    Path = "/container/set-of-primitives",
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
                return JsonUtils.Deserialize<HashSet<string>>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedExhaustiveException("Failed to deserialize response", e);
            }
        }

        throw new SeedExhaustiveApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }

    /// <example>
    /// <code>
    /// await client.Endpoints.Container.GetAndReturnSetOfObjectsAsync(
    ///     new HashSet&lt;ObjectWithRequiredField&gt;() { new ObjectWithRequiredField { String = "string" } }
    /// );
    /// </code>
    /// </example>
    public async Task<HashSet<ObjectWithRequiredField>> GetAndReturnSetOfObjectsAsync(
        HashSet<ObjectWithRequiredField> request,
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
                    Path = "/container/set-of-objects",
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
                return JsonUtils.Deserialize<HashSet<ObjectWithRequiredField>>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedExhaustiveException("Failed to deserialize response", e);
            }
        }

        throw new SeedExhaustiveApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }

    /// <example>
    /// <code>
    /// await client.Endpoints.Container.GetAndReturnMapPrimToPrimAsync(
    ///     new Dictionary&lt;string, string&gt;() { { "string", "string" } }
    /// );
    /// </code>
    /// </example>
    public async Task<Dictionary<string, string>> GetAndReturnMapPrimToPrimAsync(
        Dictionary<string, string> request,
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
                    Path = "/container/map-prim-to-prim",
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
                return JsonUtils.Deserialize<Dictionary<string, string>>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedExhaustiveException("Failed to deserialize response", e);
            }
        }

        throw new SeedExhaustiveApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }

    /// <example>
    /// <code>
    /// await client.Endpoints.Container.GetAndReturnMapOfPrimToObjectAsync(
    ///     new Dictionary&lt;string, ObjectWithRequiredField&gt;()
    ///     {
    ///         {
    ///             "string",
    ///             new ObjectWithRequiredField { String = "string" }
    ///         },
    ///     }
    /// );
    /// </code>
    /// </example>
    public async Task<
        Dictionary<string, ObjectWithRequiredField>
    > GetAndReturnMapOfPrimToObjectAsync(
        Dictionary<string, ObjectWithRequiredField> request,
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
                    Path = "/container/map-prim-to-object",
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
                return JsonUtils.Deserialize<Dictionary<string, ObjectWithRequiredField>>(
                    responseBody
                )!;
            }
            catch (JsonException e)
            {
                throw new SeedExhaustiveException("Failed to deserialize response", e);
            }
        }

        throw new SeedExhaustiveApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }

    /// <example>
    /// <code>
    /// await client.Endpoints.Container.GetAndReturnOptionalAsync(
    ///     new ObjectWithRequiredField { String = "string" }
    /// );
    /// </code>
    /// </example>
    public async Task<ObjectWithRequiredField?> GetAndReturnOptionalAsync(
        ObjectWithRequiredField? request,
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
                    Path = "/container/opt-objects",
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
                return JsonUtils.Deserialize<ObjectWithRequiredField?>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedExhaustiveException("Failed to deserialize response", e);
            }
        }

        throw new SeedExhaustiveApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }
}
