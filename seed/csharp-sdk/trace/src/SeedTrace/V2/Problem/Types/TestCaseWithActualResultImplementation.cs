using System.Text.Json.Serialization;
using SeedTrace.V2;

namespace SeedTrace.V2;

public class TestCaseWithActualResultImplementation
{
    [JsonPropertyName("getActualResult")]
    public NonVoidFunctionDefinition GetActualResult { get; init; }

    [JsonPropertyName("assertCorrectnessCheck")]
    public AssertCorrectnessCheck AssertCorrectnessCheck { get; init; }
}
