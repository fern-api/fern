using SeedApi;

namespace Usage;

public class Example3
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.S3.GetpresignedurlAsync(
            new S3GetPresignedUrlRequest {
                S3Key = "s3Key"
            }
        );
    }

}
