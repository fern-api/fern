using System.Text.Json;
using SeedIdempotencyHeaders.Core;

namespace SeedIdempotencyHeaders;

public partial class PaymentClient : IPaymentClient
{
    private RawClient _client;

    internal PaymentClient(RawClient client)
    {
        _client = client;
    }

    private async Task<WithRawResponse<string>> CreateAsyncCore(
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
                var responseData = JsonUtils.Deserialize<string>(responseBody)!;
                return new WithRawResponse<string>()
                {
                    Data = responseData,
                    RawResponse = new RawResponse()
                    {
                        StatusCode = response.Raw.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                        Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                    },
                };
            }
            catch (JsonException e)
            {
                throw new SeedIdempotencyHeadersApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
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

    /// <example><code>
    /// await client.Payment.CreateAsync(new CreatePaymentRequest { Amount = 1, Currency = Currency.Usd });
    /// </code></example>
    public WithRawResponseTask<string> CreateAsync(
        CreatePaymentRequest request,
        IdempotentRequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<string>(
            CreateAsyncCore(request, options, cancellationToken)
        );
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
            return;
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
