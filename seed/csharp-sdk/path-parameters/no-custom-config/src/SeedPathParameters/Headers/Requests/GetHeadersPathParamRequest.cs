using global::System.Text.Json.Serialization;
using SeedPathParameters.Core;

namespace SeedPathParameters;

[Serializable]
public record GetHeadersPathParamRequest
{
    [JsonIgnore]
    public required string TenantId { get; set; }

    [JsonIgnore]
    public required string HeaderId { get; set; }

    [JsonIgnore]
    public required string XTenantId { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
