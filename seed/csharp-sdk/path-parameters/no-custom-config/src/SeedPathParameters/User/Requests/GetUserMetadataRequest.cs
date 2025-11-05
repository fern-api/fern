using System.Text.Json.Serialization;
using SeedPathParameters.Core;

namespace SeedPathParameters;

[Serializable]
public record GetUserMetadataRequest
{
    [JsonIgnore]
    public required string TenantId { get; set; }

    [JsonIgnore]
    public required string UserId { get; set; }

    [JsonIgnore]
    public required int Version { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
