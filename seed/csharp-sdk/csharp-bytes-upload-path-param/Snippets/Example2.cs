using SeedCsharpBytesUploadPathParam;

public partial class Examples
{
    public async Task Example2() {
        var client = new SeedCsharpBytesUploadPathParamClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.UpdateMetadataWithPathParamAsync(
            new UpdateMetadataRequest {
                TenantId = "<tenantId>",
                ObjectPath = "objectPath"
            }
        );
    }

}
