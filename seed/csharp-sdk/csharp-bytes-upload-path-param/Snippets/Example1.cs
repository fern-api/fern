using SeedCsharpBytesUploadPathParam;

public partial class Examples
{
    public async Task Example1() {
        var client = new SeedCsharpBytesUploadPathParamClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.UpdateMetadataWithPathParamAsync(
            new UpdateMetadataRequest {
                TenantId = "acme",
                ObjectPath = "path/to/object.txt",
                Label = "primary"
            }
        );
    }

}
