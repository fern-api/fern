using System.Text.Json.Serialization;
using SeedMultiUrlEnvironment.Core;

namespace SeedMultiUrlEnvironment;

[Serializable]
public record GetPresignedUrlRequest
{
    [JsonPropertyName("s3Key")]
    public required string S3Key { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
