using SeedMultiUrlEnvironment;

namespace Usage;

public class Example1
{
    public async Task Do() {
        var client = new SeedMultiUrlEnvironmentClient(
            token: "<token>"
        );

        await client.S3.GetPresignedUrlAsync(
            new GetPresignedUrlRequest {
                S3Key = "s3Key"
            }
        );
    }

}
