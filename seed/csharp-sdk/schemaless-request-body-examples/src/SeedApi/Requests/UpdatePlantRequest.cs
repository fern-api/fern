using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record UpdatePlantRequest
{
    [JsonIgnore]
    public required string PlantId { get; set; }

    [JsonIgnore]
    public required object Body { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
