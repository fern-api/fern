using System.Text.Json.Serialization;
using Client.V2;
using OneOf;

namespace Client.V2;

public class TestCaseWithActualResultImplementation
{
    [JsonPropertyName("getActualResult")]
    public NonVoidFunctionDefinition GetActualResult { get; init; }

    [JsonPropertyName("assertCorrectnessCheck")]
    public OneOf<AssertCorrectnessCheck._DeepEquality, AssertCorrectnessCheck._Custom> AssertCorrectnessCheck { get; init; }
}
