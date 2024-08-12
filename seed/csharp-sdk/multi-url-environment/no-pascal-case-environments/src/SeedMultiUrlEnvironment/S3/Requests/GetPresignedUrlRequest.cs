using System.Text.Json.Serialization;

#nullable enable

namespace SeedMultiUrlEnvironment;

public record GetPresignedUrlRequest
{
    [JsonPropertyName("s3Key")]
    public required string S3Key { get; set; }
}
