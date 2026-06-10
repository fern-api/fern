using global::System.Text.Json.Serialization;
using SeedCsharpElidePathParameters.Core;

namespace SeedCsharpElidePathParameters;

[Serializable]
public record GetHeadersPathParamBodyRequest
{
    [JsonIgnore]
    public required string XTenantId { get; set; }

    [JsonIgnore]
    public required User Body { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
