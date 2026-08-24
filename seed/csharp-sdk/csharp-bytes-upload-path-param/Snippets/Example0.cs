using SeedCsharpBytesUploadPathParam;
using System.Globalization;
using System.Text;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedCsharpBytesUploadPathParamClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.UploadWithPathParamAsync(
            tenantId: "<tenantId>",
            objectPath: "objectPath",
            revision: 1000000L,
            uploadedAt: DateTime.Parse("2024-01-15T09:30:00Z", null, DateTimeStyles.AdjustToUniversal),
            region: BucketRegion.UsEast,
            request: new MemoryStream(Encoding.UTF8.GetBytes("[bytes]"))
        );
    }

}
