using System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record CreatePlantOrderRequest
{
    [JsonIgnore]
    public required string PlantId { get; set; }

    [JsonIgnore]
    public required PlantOrder Body { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
