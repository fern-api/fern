using System.Text.Json;
using SeedExhaustive.Core;

namespace SeedExhaustive;

public partial class NoAuthClient : INoAuthClient
{
    private RawClient _client;

    internal NoAuthClient(RawClient client)
    {
        try
        {
            _client = client;
            Raw = new WithRawResponseClient(_client);
        }
        catch (Exception ex)
        {
            client.Options.ExceptionHandler?.CaptureException(ex);
            throw;
        }
    }

    public NoAuthClient.WithRawResponseClient Raw { get; }

    /// <summary>
    /// POST request with no auth
    /// </summary>
    /// <example><code>
    /// await client.NoAuth.PostWithNoAuthAsync(new Dictionary&lt;object, object?&gt;() { { "key", "value" } });
    /// </code></example>
    public async Task<bool> PostWithNoAuthAsync(
        object request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
            {
                var response = await Raw.PostWithNoAuthAsync(request, options, cancellationToken);
                return response.Data;
            })
            .ConfigureAwait(false);
    }

    public partial class WithRawResponseClient
    {
        private readonly RawClient _client;

        internal WithRawResponseClient(RawClient client)
        {
            _client = client;
        }

        /// <summary>
        /// POST request with no auth
        /// </summary>
        public async Task<WithRawResponse<bool>> PostWithNoAuthAsync(
            object request,
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
                                Path = "/no-auth",
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
                            var data = JsonUtils.Deserialize<bool>(responseBody)!;
                            return new WithRawResponse<bool>
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
                        try
                        {
                            switch (response.StatusCode)
                            {
                                case 400:
                                    throw new BadRequestBody(
                                        JsonUtils.Deserialize<BadObjectRequestInfo>(responseBody)
                                    );
                            }
                        }
                        catch (JsonException)
                        {
                            // unable to map error response, throwing generic error
                        }
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
