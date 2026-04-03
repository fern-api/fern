using SeedCrossPackageTypeNames;

public partial class Examples
{
    public static async Task Example2()
    {
        var client = new SeedCrossPackageTypeNamesClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Foo.FindAsync(
            new FindRequest {
                OptionalString = "optionalString",
                PublicProperty = "publicProperty",
                PrivateProperty = 1
            }
        );
    }

}
