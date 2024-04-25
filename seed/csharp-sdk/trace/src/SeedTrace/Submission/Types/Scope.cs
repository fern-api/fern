using System.Text.Json.Serialization;
using SeedTrace;

namespace SeedTrace;

public class Scope
{
    [JsonPropertyName("variables")]
    public List<Dictionary<string, DebugVariableValue>> Variables { get; init; }
}
