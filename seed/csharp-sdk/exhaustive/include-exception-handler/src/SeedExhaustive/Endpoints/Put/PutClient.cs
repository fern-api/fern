using System.Text.Json;
using SeedExhaustive;
using SeedExhaustive.Core;

namespace SeedExhaustive.Endpoints;

public partial class PutClient : IPutClient
{
    private RawClient _client;

    internal PutClient(RawClient client)
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

    public PutClient.RawAccessClient Raw { get; }

    /// <example><code>
    /// await client.Endpoints.Put.AddAsync(new PutRequest { Id = "id" });
    /// </code></example>
    public async Task<PutResponse> AddAsync(
        PutRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
            {
                var response = await Raw.AddAsync(request, options, cancellationToken);
                return response.Data;
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

        public async Task<WithRawResponse<PutResponse>> AddAsync(
            PutRequest request,
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
                                Method = HttpMethod.Put,
                                Path = string.Format(
                                    "{0}",
                                    ValueConvert.ToPathParameterString(request.Id)
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
                            var data = JsonUtils.Deserialize<PutResponse>(responseBody)!;
                            return new WithRawResponse<PutResponse>
                            {
                                Data = data,
                                RawResponse = new RawResponse
                                {
                                    StatusCode = (global::System.Net.HttpStatusCode)
                                        response.StatusCode,
                                    Url = response.Raw.RequestMessage?.RequestUri!,
                                    Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                                },
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
