using SeedEnum;

public partial class Examples
{
    public async Task Example3() {
        var client = new SeedEnumClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.PathParam.SendAsync(
            Operand.GreaterThan,
            Color.Red
        );
    }

}
