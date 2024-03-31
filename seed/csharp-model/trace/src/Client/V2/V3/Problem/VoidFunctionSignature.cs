using System.Text.Json.Serialization;
using Client.V2.V3;

namespace Client.V2.V3;

public class VoidFunctionSignature
{
    [JsonPropertyName("parameters")]
    public List<Parameter> Parameters { get; init; }
}
