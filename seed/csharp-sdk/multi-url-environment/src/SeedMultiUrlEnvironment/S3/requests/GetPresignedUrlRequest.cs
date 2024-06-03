using System.Text.Json.Serialization;

#nullable enable

namespace SeedMultiUrlEnvironment;

public class GetPresignedUrlRequest
{
    [JsonPropertyName("s3Key")]
    public string S3Key { get; init; }
}
