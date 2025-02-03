using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace.V2.V3;

public record VoidFunctionSignature
{
    [JsonPropertyName("parameters")]
    public IEnumerable<Parameter> Parameters { get; set; } = new List<Parameter>();

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
