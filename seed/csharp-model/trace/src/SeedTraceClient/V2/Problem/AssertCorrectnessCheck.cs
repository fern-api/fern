using SeedTraceClient.V2
using System.Text.Json.Serialization

namespace SeedTraceClient.V2

public class AssertCorrectnessCheck
{
    public class _DeepEqualityCorrectnessCheck : DeepEqualityCorrectnessCheck
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "deepEquality";
    }
    public class _VoidFunctionDefinitionThatTakesActualResult : VoidFunctionDefinitionThatTakesActualResult
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "custom";
    }
}
