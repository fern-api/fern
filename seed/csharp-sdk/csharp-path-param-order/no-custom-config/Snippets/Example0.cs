using SeedCsharpPathParamOrder;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedCsharpPathParamOrderClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.SetApprovedBillAsync(
            285,
            "true"
        );
    }

}
