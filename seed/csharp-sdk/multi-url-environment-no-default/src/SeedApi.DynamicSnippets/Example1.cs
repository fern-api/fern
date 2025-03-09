using global::System.Threading.Tasks;
using SeedMultiUrlEnvironmentNoDefault;

namespace Usage;

public class Example1
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedMultiUrlEnvironmentNoDefaultClient(
            token: "<token>"
        );

        await client.S3.GetPresignedUrlAsync(
            new GetPresignedUrlRequest{
                S3Key = "s3Key"
            }
        );
    }

}
