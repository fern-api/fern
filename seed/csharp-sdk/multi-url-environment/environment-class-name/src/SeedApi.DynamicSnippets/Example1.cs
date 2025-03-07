using global::System.Threading.Tasks;
using SeedMultiUrlEnvironment;

namespace Usage;

public class Example1
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedMultiUrlEnvironmentClient(
            token: "<token>"
        );

        await client.S3.GetPresignedUrlAsync(
            new GetPresignedUrlRequest{
                S3Key = "s3Key"
            }
        );
    }

}
