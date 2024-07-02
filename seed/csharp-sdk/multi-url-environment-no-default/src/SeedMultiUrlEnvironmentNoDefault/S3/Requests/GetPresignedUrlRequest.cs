using System.Text.Json.Serialization;

#nullable enable

namespace SeedMultiUrlEnvironmentNoDefault;

public class GetPresignedUrlRequest
{
    [JsonPropertyName("s3Key")]
    public string S3Key { get; init; }
}
