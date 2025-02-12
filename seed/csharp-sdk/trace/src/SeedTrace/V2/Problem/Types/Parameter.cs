using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace.V2;

public record Parameter
{
    [JsonPropertyName("parameterId")]
    public required string ParameterId { get; set; }

    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("variableType")]
    public required object VariableType { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
