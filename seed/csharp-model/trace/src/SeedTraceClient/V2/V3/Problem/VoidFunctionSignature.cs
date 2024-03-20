using System.Text.Json.Serialization;
using SeedTraceClient.V2.V3;

namespace SeedTraceClient.V2.V3;

public class VoidFunctionSignature
{
    [JsonPropertyName("parameters")]
    public List<Parameter> Parameters { get; init; }
}
