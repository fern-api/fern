using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

public record VariableTypeAndName
{
    [JsonPropertyName("variableType")]
    public required object VariableType { get; set; }

    [JsonPropertyName("name")]
    public required string Name { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
