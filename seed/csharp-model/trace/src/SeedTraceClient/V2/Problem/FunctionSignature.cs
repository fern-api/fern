using SeedTraceClient.V2
using System.Text.Json.Serialization

namespace SeedTraceClient.V2

public class FunctionSignature
{
    public class _VoidFunctionSignature : VoidFunctionSignature
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "void";
    }
    public class _NonVoidFunctionSignature : NonVoidFunctionSignature
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "nonVoid";
    }
    public class _VoidFunctionSignatureThatTakesActualResult : VoidFunctionSignatureThatTakesActualResult
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "voidThatTakesActualResult";
    }
}
