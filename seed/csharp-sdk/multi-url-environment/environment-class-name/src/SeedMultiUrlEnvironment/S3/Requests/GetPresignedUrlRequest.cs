using System.Text.Json;
using System.Text.Json.Serialization;
using SeedMultiUrlEnvironment.Core;

namespace SeedMultiUrlEnvironment;

public record GetPresignedUrlRequest
{
    [JsonPropertyName("s3Key")]
    public required string S3Key { get; set; }

    /// <summary>
    /// Additional properties received from the response, if any.
    /// </summary>
    [JsonExtensionData]
    public IDictionary<string, JsonElement> AdditionalProperties { get; internal set; } =
        new Dictionary<string, JsonElement>();

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
