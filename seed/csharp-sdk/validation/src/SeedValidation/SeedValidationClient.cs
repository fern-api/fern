using System.Text.Json;
using SeedValidation.Core;

namespace SeedValidation;

public partial class SeedValidationClient
{
    private readonly RawClient _client;

    public SeedValidationClient(ClientOptions? clientOptions = null)
    {
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedValidation" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernvalidation/0.0.1" },
            }
        );
        clientOptions ??= new ClientOptions();
        foreach (var header in defaultHeaders)
        {
            if (!clientOptions.Headers.ContainsKey(header.Key))
            {
                clientOptions.Headers[header.Key] = header.Value;
            }
        }
        _client = new RawClient(clientOptions);
    }

    /// <example><code>
    /// await client.CreateAsync(
    ///     new CreateRequest
    ///     {
    ///         Decimal = 2.2,
    ///         Even = 100,
    ///         Name = "fern",
    ///         Shape = Shape.Square,
    ///     }
    /// );
    /// </code></example>
    public async Task<Type> CreateAsync(
        CreateRequest request,
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
                    Path = "/create",
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
                return JsonUtils.Deserialize<Type>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedValidationException("Failed to deserialize response", e);
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedValidationApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <example><code>
    /// await client.GetAsync(
    ///     new GetRequest
    ///     {
    ///         Decimal = 2.2,
    ///         Even = 100,
    ///         Name = "fern",
    ///     }
    /// );
    /// </code></example>
    public async Task<Type> GetAsync(
        GetRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _query = new Dictionary<string, object>();
        _query["decimal"] = request.Decimal.ToString();
        _query["even"] = request.Even.ToString();
        _query["name"] = request.Name;
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Get,
                    Path = "",
                    Query = _query,
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
                return JsonUtils.Deserialize<Type>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedValidationException("Failed to deserialize response", e);
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedValidationApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }
}
