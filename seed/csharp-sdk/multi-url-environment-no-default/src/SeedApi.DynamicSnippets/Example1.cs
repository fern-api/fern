using SeedMultiUrlEnvironmentNoDefault;

namespace Usage;

public class Example1
{
    public async Task Do() {
        var client = new SeedMultiUrlEnvironmentNoDefaultClient(
            clientOptions: new ClientOptions {
                Environment = SeedMultiUrlEnvironmentNoDefaultEnvironment.Production
            },
            token: "<token>"
        );

        await client.S3.GetPresignedUrlAsync(
            new GetPresignedUrlRequest {
                S3Key = "s3Key"
            }
        );
    }

}
