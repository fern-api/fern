using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace.V2;

public record GetFunctionSignatureRequest
{
    [JsonPropertyName("functionSignature")]
    public required object FunctionSignature { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
