using System.Text.Json.Serialization
using SeedTraceClient.V2
using OneOf

namespace SeedTraceClient.V2

public class TestCaseWithActualResultImplementation
{
    [JsonPropertyName("getActualResult")]
    public NonVoidFunctionDefinition GetActualResult { get; init; }

    [JsonPropertyName("assertCorrectnessCheck")]
    public OneOf<DeepEqualityCorrectnessCheck, VoidFunctionDefinitionThatTakesActualResult> AssertCorrectnessCheck { get; init; }
}
