using System.Text.Json;
using SeedIdempotencyHeaders;

#nullable enable

namespace SeedIdempotencyHeaders;

public class PaymentClient
{
    private RawClient _client;

    public PaymentClient(RawClient client)
    {
        _client = client;
    }

    public async Task<Guid> CreateAsync(CreatePaymentRequest request)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest
            {
                Method = HttpMethod.Post,
                Path = "/payment",
                Body = request
            }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode >= 200 && response.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<Guid>(responseBody);
        }
        throw new Exception(responseBody);
    }

    public async void DeleteAsync(string paymentId)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest { Method = HttpMethod.Delete, Path = $"/payment/{paymentId}" }
        );
    }
}
