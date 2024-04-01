using System.Text.Json.Serialization;
using SeedTrace.V2;

namespace SeedTrace.V2;

public class VoidFunctionSignature
{
    [JsonPropertyName("parameters")]
    public List<Parameter> Parameters { get; init; }
}
