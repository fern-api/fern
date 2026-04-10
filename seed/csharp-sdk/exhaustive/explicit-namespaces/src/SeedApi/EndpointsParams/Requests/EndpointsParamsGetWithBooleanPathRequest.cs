using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi.EndpointsParams;

[Serializable]
public record EndpointsParamsGetWithBooleanPathRequest
{
    [JsonIgnore]
    public required bool Param { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
