using SeedIdempotencyHeaders;

namespace SeedIdempotencyHeaders;

public class PaymentClient
{
    private RawClient _client;

    public PaymentClient(RawClient client)
    {
        _client = client;
    }

    public async void CreateAsync() { }

    public async void DeleteAsync() { }
}
