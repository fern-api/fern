using System.Text.Json;
using SeedIdempotencyHeaders.Core;

namespace SeedIdempotencyHeaders;

public partial class PaymentClient
{
    private RawClient _client;

    internal PaymentClient(RawClient client)
    {
        _client = client;
    }

    /// <example><code>
    /// await client.Payment.CreateAsync(new CreatePaymentRequest { Amount = 1, Currency = Currency.Usd });
    /// </code></example>
    public async Task<string> CreateAsync(
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
                return JsonUtils.Deserialize<string>(responseBody)!;
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
