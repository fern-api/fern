using System.Text.Json.Serialization;
using SeedTrace.V2;
using OneOf;

namespace SeedTrace.V2;

public class TestCaseWithActualResultImplementation
{
    [JsonPropertyName("getActualResult")]
    public NonVoidFunctionDefinition GetActualResult { get; init; }

    [JsonPropertyName("assertCorrectnessCheck")]
    public OneOf<AssertCorrectnessCheck._DeepEquality, AssertCorrectnessCheck._Custom> AssertCorrectnessCheck { get; init; }
}
