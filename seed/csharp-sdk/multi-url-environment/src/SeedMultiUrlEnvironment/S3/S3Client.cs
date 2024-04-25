using SeedMultiUrlEnvironment;

namespace SeedMultiUrlEnvironment;

public class S3Client
{
    private RawClient _client;

    public S3Client(RawClient client)
    {
        _client = client;
    }

    public async void GetPresignedUrlAsync() { }
}
