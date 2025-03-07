using global::System.Threading.Tasks;
using SeedMultiUrlEnvironment;
using SeedMultiUrlEnvironment.Core;

namespace Usage;

public class Example1
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedMultiUrlEnvironmentClient(
            token: "<token>",
            clientOptions: new ClientOptions{
                Environment = "https://api.fern.com"
            }
        );

        await client.S3.GetPresignedUrlAsync(
            new GetPresignedUrlRequest{
                S3Key = "s3Key"
            }
        );
    }

}
