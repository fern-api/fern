using System.Text.Json;
using SeedExhaustive;
using SeedExhaustive.Core;
using SeedExhaustive.Types;

namespace SeedExhaustive.Endpoints;

public partial class UnionClient : IUnionClient
{
    private RawClient _client;

    internal UnionClient(RawClient client)
    {
        try
        {
            _client = client;
            Raw = new RawAccessClient(_client);
        }
        catch (Exception ex)
        {
            client.Options.ExceptionHandler?.CaptureException(ex);
            throw;
        }
    }

    public UnionClient.RawAccessClient Raw { get; }

    /// <example><code>
    /// await client.Endpoints.Union.GetAndReturnUnionAsync(
    ///     new Animal(new Animal.Dog(new Dog { Name = "name", LikesToWoof = true }))
    /// );
    /// </code></example>
    public async Task<Animal> GetAndReturnUnionAsync(
        Animal request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
            {
                var response = await _client
                    .SendRequestAsync(
                        new JsonRequest
                        {
                            BaseUrl = _client.Options.BaseUrl,
                            Method = HttpMethod.Post,
                            Path = "/union",
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
                        return JsonUtils.Deserialize<Animal>(responseBody)!;
                    }
                    catch (JsonException e)
                    {
                        throw new SeedExhaustiveException("Failed to deserialize response", e);
                    }
                }

                {
                    var responseBody = await response.Raw.Content.ReadAsStringAsync();
                    throw new SeedExhaustiveApiException(
                        $"Error with status code {response.StatusCode}",
                        response.StatusCode,
                        responseBody
                    );
                }
            })
            .ConfigureAwait(false);
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

        public async Task<RawResponse<Animal>> GetAndReturnUnionAsync(
            Animal request,
            RequestOptions? options = null,
            CancellationToken cancellationToken = default
        )
        {
            return await _client
                .Options.ExceptionHandler.TryCatchAsync(async () =>
                {
                    var response = await _client
                        .SendRequestAsync(
                            new JsonRequest
                            {
                                BaseUrl = _client.Options.BaseUrl,
                                Method = HttpMethod.Post,
                                Path = "/union",
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
                            var body = JsonUtils.Deserialize<Animal>(responseBody)!;
                            return new RawResponse<Animal>
                            {
                                StatusCode = (System.Net.HttpStatusCode)response.StatusCode,
                                Url = response.Raw.RequestMessage?.RequestUri!,
                                Headers = ExtractHeaders(response.Raw),
                                Body = body,
                            };
                        }
                        catch (JsonException e)
                        {
                            throw new SeedExhaustiveException("Failed to deserialize response", e);
                        }
                    }

                    {
                        var responseBody = await response.Raw.Content.ReadAsStringAsync();
                        throw new SeedExhaustiveApiException(
                            $"Error with status code {response.StatusCode}",
                            response.StatusCode,
                            responseBody
                        );
                    }
                })
                .ConfigureAwait(false);
        }
    }
}
