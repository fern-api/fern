using System.Text.Json;
using SeedIdempotencyHeaders.Core;

namespace SeedIdempotencyHeaders;

public partial class PaymentClient : IPaymentClient
{
    private RawClient _client;

    internal PaymentClient(RawClient client)
    {
        _client = client;
        Raw = new WithRawResponseClient(_client);
    }

    public PaymentClient.WithRawResponseClient Raw { get; }

    /// <example><code>
    /// await client.Payment.CreateAsync(new CreatePaymentRequest { Amount = 1, Currency = Currency.Usd });
    /// </code></example>
    public async Task<string> CreateAsync(
        CreatePaymentRequest request,
        IdempotentRequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await Raw.CreateAsync(request, options, cancellationToken);
        return response.Data;
    }

    /// <example><code>
    /// await client.Payment.DeleteAsync("paymentId");
    /// </code></example>
    public async Task DeleteAsync(
        string paymentId,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        await Raw.DeleteAsync(paymentId, options, cancellationToken);
    }

    public partial class WithRawResponseClient
    {
        private readonly RawClient _client;

        internal WithRawResponseClient(RawClient client)
        {
            _client = client;
        }

        public async Task<WithRawResponse<string>> CreateAsync(
            CreatePaymentRequest request,
            IdempotentRequestOptions? options = null,
            CancellationToken cancellationToken = default
        )
        {
            var response = await _client
                .SendRequestAsync(
                    new JsonRequest
                    {
                        BaseUrl = _client.Options.BaseUrl,
                        Method = HttpMethod.Post,
                        Path = "/payment",
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
                    var data = JsonUtils.Deserialize<string>(responseBody)!;
                    return new WithRawResponse<string>
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
                    throw new SeedIdempotencyHeadersException("Failed to deserialize response", e);
                }
            }

            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                throw new SeedIdempotencyHeadersApiException(
                    $"Error with status code {response.StatusCode}",
                    response.StatusCode,
                    responseBody
                );
            }
        }

        public async Task<WithRawResponse<object>> DeleteAsync(
            string paymentId,
            RequestOptions? options = null,
            CancellationToken cancellationToken = default
        )
        {
            var response = await _client
                .SendRequestAsync(
                    new JsonRequest
                    {
                        BaseUrl = _client.Options.BaseUrl,
                        Method = HttpMethod.Delete,
                        Path = string.Format(
                            "/payment/{0}",
                            ValueConvert.ToPathParameterString(paymentId)
                        ),
                        Options = options,
                    },
                    cancellationToken
                )
                .ConfigureAwait(false);
            if (response.StatusCode is >= 200 and < 400)
            {
                return new WithRawResponse<object>
                {
                    Data = new object(),
                    RawResponse = new RawResponse
                    {
                        StatusCode = (global::System.Net.HttpStatusCode)response.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri!,
                        Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                    },
                };
            }
            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                throw new SeedIdempotencyHeadersApiException(
                    $"Error with status code {response.StatusCode}",
                    response.StatusCode,
                    responseBody
                );
            }
        }
    }
}
