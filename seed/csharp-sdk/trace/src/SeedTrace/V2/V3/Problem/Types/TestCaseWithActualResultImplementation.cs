using System.Text.Json.Serialization;
using SeedTrace.V2.V3;

namespace SeedTrace.V2.V3;

public class TestCaseWithActualResultImplementation
{
    [JsonPropertyName("getActualResult")]
    public NonVoidFunctionDefinition GetActualResult { get; init; }

    [JsonPropertyName("assertCorrectnessCheck")]
    public AssertCorrectnessCheck AssertCorrectnessCheck { get; init; }
}
