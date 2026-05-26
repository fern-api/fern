using SeedApi;

public partial class Examples
{
    public async Task Example6() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.GetInvoiceAsync(
            new GetInvoiceRequest {
                InvoiceId = "invoiceId"
            }
        );
    }

}
