using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi.EndpointsParams;

[Serializable]
public record EndpointsParamsGetWithPathRequest
{
    [JsonIgnore]
    public required string Param { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
