using System.Text.Json.Serialization;

namespace SeedMultiUrlEnvironment;

public class GetPresignedUrlRequest
{
    [JsonPropertyName("s3Key")]
    public string S3Key { get; init; }
}
