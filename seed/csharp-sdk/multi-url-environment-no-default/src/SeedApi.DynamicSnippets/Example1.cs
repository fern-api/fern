using SeedMultiUrlEnvironmentNoDefault;

public partial class Examples
{
    public static async Task Example1()
    {
        var client = new SeedMultiUrlEnvironmentNoDefaultClient(
            token: "<token>"
        );

        await client.S3.GetPresignedUrlAsync(
            new GetPresignedUrlRequest {
                S3Key = "s3Key"
            }
        );
    }

}
