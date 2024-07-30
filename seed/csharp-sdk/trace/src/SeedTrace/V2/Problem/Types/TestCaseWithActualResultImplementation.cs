using System.Text.Json.Serialization;
using SeedTrace.V2;

#nullable enable

namespace SeedTrace.V2;

public record TestCaseWithActualResultImplementation
{
    [JsonPropertyName("getActualResult")]
    public required NonVoidFunctionDefinition GetActualResult { get; }

    [JsonPropertyName("assertCorrectnessCheck")]
    public required object AssertCorrectnessCheck { get; }
}
