using System.Net.Http;
using System.Text.Json;
using System.Threading;
using SeedResponseProperty.Core;

namespace SeedResponseProperty;

public partial class ServiceClient
{
    private RawClient _client;

    internal ServiceClient(RawClient client)
    {
        _client = client;
    }

    /// <example>
    /// <code>
    /// await client.Service.GetMovieAsync("string");
    /// </code>
    /// </example>
    public async Task<Response> GetMovieAsync(
        string request,
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
                    Path = "movie",
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
                return JsonUtils.Deserialize<Response>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedResponsePropertyException("Failed to deserialize response", e);
            }
        }

        throw new SeedResponsePropertyApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }

    /// <example>
    /// <code>
    /// await client.Service.GetMovieDocsAsync("string");
    /// </code>
    /// </example>
    public async Task<Response> GetMovieDocsAsync(
        string request,
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
                    Path = "movie",
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
                return JsonUtils.Deserialize<Response>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedResponsePropertyException("Failed to deserialize response", e);
            }
        }

        throw new SeedResponsePropertyApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }

    /// <example>
    /// <code>
    /// await client.Service.GetMovieNameAsync("string");
    /// </code>
    /// </example>
    public async Task<StringResponse> GetMovieNameAsync(
        string request,
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
                    Path = "movie",
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
                return JsonUtils.Deserialize<StringResponse>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedResponsePropertyException("Failed to deserialize response", e);
            }
        }

        throw new SeedResponsePropertyApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }

    /// <example>
    /// <code>
    /// await client.Service.GetMovieMetadataAsync("string");
    /// </code>
    /// </example>
    public async Task<Response> GetMovieMetadataAsync(
        string request,
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
                    Path = "movie",
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
                return JsonUtils.Deserialize<Response>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedResponsePropertyException("Failed to deserialize response", e);
            }
        }

        throw new SeedResponsePropertyApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }

    /// <example>
    /// <code>
    /// await client.Service.GetOptionalMovieAsync("string");
    /// </code>
    /// </example>
    public async Task<Response?> GetOptionalMovieAsync(
        string request,
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
                    Path = "movie",
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
                return JsonUtils.Deserialize<Response?>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedResponsePropertyException("Failed to deserialize response", e);
            }
        }

        throw new SeedResponsePropertyApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }

    /// <example>
    /// <code>
    /// await client.Service.GetOptionalMovieDocsAsync("string");
    /// </code>
    /// </example>
    public async Task<WithDocs?> GetOptionalMovieDocsAsync(
        string request,
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
                    Path = "movie",
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
                return JsonUtils.Deserialize<WithDocs?>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedResponsePropertyException("Failed to deserialize response", e);
            }
        }

        throw new SeedResponsePropertyApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }

    /// <example>
    /// <code>
    /// await client.Service.GetOptionalMovieNameAsync("string");
    /// </code>
    /// </example>
    public async Task<StringResponse?> GetOptionalMovieNameAsync(
        string request,
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
                    Path = "movie",
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
                return JsonUtils.Deserialize<StringResponse?>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedResponsePropertyException("Failed to deserialize response", e);
            }
        }

        throw new SeedResponsePropertyApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }
}
