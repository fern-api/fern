using System.Text.Json;
using SeedValidation.Core;

namespace SeedValidation;

public partial class SeedValidationClient : ISeedValidationClient
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
        Raw = new WithRawResponseClient(_client);
    }

    public SeedValidationClient.WithRawResponseClient Raw { get; }

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
        var response = await Raw.CreateAsync(request, options, cancellationToken);
        return response.Data;
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
        var response = await Raw.GetAsync(request, options, cancellationToken);
        return response.Data;
    }

    public partial class WithRawResponseClient
    {
        private readonly RawClient _client;

        internal WithRawResponseClient(RawClient client)
        {
            _client = client;
        }

        public async Task<WithRawResponse<Type>> CreateAsync(
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
                    var data = JsonUtils.Deserialize<Type>(responseBody)!;
                    return new WithRawResponse<Type>
                    {
                        Data = data,
                        RawResponse = new RawResponse
                        {
                            StatusCode = (global::System.Net.HttpStatusCode)response.StatusCode,
                            Url = response.Raw.RequestMessage?.RequestUri!,
                            Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                        },
                    };
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

        public async Task<WithRawResponse<Type>> GetAsync(
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
                    var data = JsonUtils.Deserialize<Type>(responseBody)!;
                    return new WithRawResponse<Type>
                    {
                        Data = data,
                        RawResponse = new RawResponse
                        {
                            StatusCode = (global::System.Net.HttpStatusCode)response.StatusCode,
                            Url = response.Raw.RequestMessage?.RequestUri!,
                            Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                        },
                    };
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
}
