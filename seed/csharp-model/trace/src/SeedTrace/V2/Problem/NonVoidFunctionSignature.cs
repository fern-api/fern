using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace.V2;

public record NonVoidFunctionSignature
{
    [JsonPropertyName("parameters")]
    public IEnumerable<Parameter> Parameters { get; set; } = new List<Parameter>();

    [JsonPropertyName("returnType")]
    public required object ReturnType { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
