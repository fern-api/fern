using SeedApi;

public partial class Examples
{
    public async Task Example2() {
        var client = new SeedStreamingClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Payment.DeleteAsync(
            new PaymentDeleteRequest {
                PaymentId = "paymentId"
            }
        );
    }

}
