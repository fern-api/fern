using global::System.Text.Json.Serialization;
using SeedCsharpElidePathParameters.Core;

namespace SeedCsharpElidePathParameters;

[Serializable]
public record GetHeadersPathParamRequest
{
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
