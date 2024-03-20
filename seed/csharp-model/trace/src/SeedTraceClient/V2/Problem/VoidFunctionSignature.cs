using System.Text.Json.Serialization;
using SeedTraceClient.V2;

namespace SeedTraceClient.V2;

public class VoidFunctionSignature
{
    [JsonPropertyName("parameters")]
    public List<Parameter> Parameters { get; init; }
}
