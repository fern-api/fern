using System.Text.Json.Serialization;
using SeedTrace;

#nullable enable

namespace SeedTrace;

public class Scope
{
    [JsonPropertyName("variables")]
    public Dictionary<string, DebugVariableValue> Variables { get; init; }
}
