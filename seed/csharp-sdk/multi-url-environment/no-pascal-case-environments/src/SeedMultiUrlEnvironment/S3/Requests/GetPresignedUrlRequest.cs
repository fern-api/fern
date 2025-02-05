using System.Text.Json.Serialization;
using SeedMultiUrlEnvironment.Core;

namespace SeedMultiUrlEnvironment;

public record GetPresignedUrlRequest
{
    [JsonPropertyName("s3Key")]
    public required string S3Key { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
