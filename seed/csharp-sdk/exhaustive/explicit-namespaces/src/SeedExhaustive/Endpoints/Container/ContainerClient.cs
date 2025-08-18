using System.Net.Http;
using System.Text.Json;
using System.Threading;
using SeedExhaustive;
using SeedExhaustive.Core;
using SeedExhaustive.Types.Object;

namespace SeedExhaustive.Endpoints.Container;

public partial class ContainerClient
{
    private SeedExhaustive.Core.RawClient _client;

    internal ContainerClient(SeedExhaustive.Core.RawClient client)
    {
        _client = client;
    }

    /// <example><code>
    /// await client.Endpoints.Container.GetAndReturnListOfPrimitivesAsync(
    ///     new List&lt;string&gt;() { "string", "string" }
    /// );
    /// </code></example>
    public async Task<IEnumerable<string>> GetAndReturnListOfPrimitivesAsync(
        IEnumerable<string> request,
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
                    Path = "/container/list-of-primitives",
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
                return SeedExhaustive.Core.JsonUtils.Deserialize<IEnumerable<string>>(
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
    /// await client.Endpoints.Container.GetAndReturnListOfObjectsAsync(
    ///     new List&lt;SeedExhaustive.Types.Object.ObjectWithRequiredField&gt;()
    ///     {
    ///         new SeedExhaustive.Types.Object.ObjectWithRequiredField { String = "string" },
    ///         new SeedExhaustive.Types.Object.ObjectWithRequiredField { String = "string" },
    ///     }
    /// );
    /// </code></example>
    public async Task<
        IEnumerable<SeedExhaustive.Types.Object.ObjectWithRequiredField>
    > GetAndReturnListOfObjectsAsync(
        IEnumerable<SeedExhaustive.Types.Object.ObjectWithRequiredField> request,
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
                    Path = "/container/list-of-objects",
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
                return SeedExhaustive.Core.JsonUtils.Deserialize<
                    IEnumerable<SeedExhaustive.Types.Object.ObjectWithRequiredField>
                >(responseBody)!;
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
    /// await client.Endpoints.Container.GetAndReturnSetOfPrimitivesAsync(
    ///     new HashSet&lt;string&gt;() { "string" }
    /// );
    /// </code></example>
    public async Task<HashSet<string>> GetAndReturnSetOfPrimitivesAsync(
        HashSet<string> request,
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
                    Path = "/container/set-of-primitives",
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
                return SeedExhaustive.Core.JsonUtils.Deserialize<HashSet<string>>(responseBody)!;
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
    /// await client.Endpoints.Container.GetAndReturnSetOfObjectsAsync(
    ///     new HashSet&lt;SeedExhaustive.Types.Object.ObjectWithRequiredField&gt;()
    ///     {
    ///         new SeedExhaustive.Types.Object.ObjectWithRequiredField { String = "string" },
    ///     }
    /// );
    /// </code></example>
    public async Task<
        HashSet<SeedExhaustive.Types.Object.ObjectWithRequiredField>
    > GetAndReturnSetOfObjectsAsync(
        HashSet<SeedExhaustive.Types.Object.ObjectWithRequiredField> request,
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
                    Path = "/container/set-of-objects",
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
                return SeedExhaustive.Core.JsonUtils.Deserialize<
                    HashSet<SeedExhaustive.Types.Object.ObjectWithRequiredField>
                >(responseBody)!;
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
    /// await client.Endpoints.Container.GetAndReturnMapPrimToPrimAsync(
    ///     new Dictionary&lt;string, string&gt;() { { "string", "string" } }
    /// );
    /// </code></example>
    public async Task<Dictionary<string, string>> GetAndReturnMapPrimToPrimAsync(
        Dictionary<string, string> request,
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
                    Path = "/container/map-prim-to-prim",
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
                return SeedExhaustive.Core.JsonUtils.Deserialize<Dictionary<string, string>>(
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
    /// await client.Endpoints.Container.GetAndReturnMapOfPrimToObjectAsync(
    ///     new Dictionary&lt;string, SeedExhaustive.Types.Object.ObjectWithRequiredField&gt;()
    ///     {
    ///         {
    ///             "string",
    ///             new SeedExhaustive.Types.Object.ObjectWithRequiredField { String = "string" }
    ///         },
    ///     }
    /// );
    /// </code></example>
    public async Task<
        Dictionary<string, SeedExhaustive.Types.Object.ObjectWithRequiredField>
    > GetAndReturnMapOfPrimToObjectAsync(
        Dictionary<string, SeedExhaustive.Types.Object.ObjectWithRequiredField> request,
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
                    Path = "/container/map-prim-to-object",
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
                return SeedExhaustive.Core.JsonUtils.Deserialize<
                    Dictionary<string, SeedExhaustive.Types.Object.ObjectWithRequiredField>
                >(responseBody)!;
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
    /// await client.Endpoints.Container.GetAndReturnOptionalAsync(
    ///     new SeedExhaustive.Types.Object.ObjectWithRequiredField { String = "string" }
    /// );
    /// </code></example>
    public async Task<SeedExhaustive.Types.Object.ObjectWithRequiredField?> GetAndReturnOptionalAsync(
        SeedExhaustive.Types.Object.ObjectWithRequiredField? request,
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
                    Path = "/container/opt-objects",
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
                return SeedExhaustive.Core.JsonUtils.Deserialize<SeedExhaustive.Types.Object.ObjectWithRequiredField?>(
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
