using System.Text.Json.Serialization;

#nullable enable

namespace SeedMultiUrlEnvironmentNoDefault;

public record GetPresignedUrlRequest
{
    [JsonPropertyName("s3Key")]
    public required string S3Key { get; set; }
}
