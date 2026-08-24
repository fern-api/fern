using global::System.Text.Json.Serialization;
using SeedCsharpBytesUploadPathParam.Core;

namespace SeedCsharpBytesUploadPathParam;

[Serializable]
public record UpdateMetadataRequest
{
    [JsonIgnore]
    public string TenantId { get; set; } = "acme";

    [JsonIgnore]
    public required string ObjectPath { get; set; }

    [JsonIgnore]
    public string? Label { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
