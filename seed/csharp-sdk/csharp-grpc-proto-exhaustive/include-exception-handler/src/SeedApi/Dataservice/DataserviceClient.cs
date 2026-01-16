using System.Text.Json;
using SeedApi.Core;

namespace SeedApi;

public partial class DataserviceClient : IDataserviceClient
{
    private RawClient _client;

    internal DataserviceClient(RawClient client)
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

    public DataserviceClient.RawAccessClient Raw { get; }

    /// <example><code>
    /// await client.Dataservice.FooAsync();
    /// </code></example>
    public async Task<Dictionary<string, object?>> FooAsync(
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
                            Path = "foo",
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
                        return JsonUtils.Deserialize<Dictionary<string, object?>>(responseBody)!;
                    }
                    catch (JsonException e)
                    {
                        throw new SeedApiException("Failed to deserialize response", e);
                    }
                }

                {
                    var responseBody = await response.Raw.Content.ReadAsStringAsync();
                    throw new SeedApiApiException(
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

        public async Task<RawResponse<Dictionary<string, object?>>> FooAsync(
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
                                Path = "foo",
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
                            var body = JsonUtils.Deserialize<Dictionary<string, object?>>(
                                responseBody
                            )!;
                            return new RawResponse<Dictionary<string, object?>>
                            {
                                StatusCode = (global::System.Net.HttpStatusCode)response.StatusCode,
                                Url = response.Raw.RequestMessage?.RequestUri!,
                                Headers = new ResponseHeaders(ExtractHeaders(response.Raw)),
                                Body = body,
                            };
                        }
                        catch (JsonException e)
                        {
                            throw new SeedApiException("Failed to deserialize response", e);
                        }
                    }

                    {
                        var responseBody = await response.Raw.Content.ReadAsStringAsync();
                        throw new SeedApiApiException(
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
