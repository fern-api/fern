using SeedCsharpPathParamOrder;

public partial class Examples
{
    public async Task Example1() {
        var client = new SeedCsharpPathParamOrderClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.SetApprovedBillAsync(
            1,
            "approved"
        );
    }

}
