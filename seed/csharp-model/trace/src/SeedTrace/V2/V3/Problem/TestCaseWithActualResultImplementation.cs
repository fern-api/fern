using System.Text.Json.Serialization;
using SeedTrace.V2.V3;

#nullable enable

namespace SeedTrace.V2.V3;

public record TestCaseWithActualResultImplementation
{
    [JsonPropertyName("getActualResult")]
    public required NonVoidFunctionDefinition GetActualResult { get; set; }

    [JsonPropertyName("assertCorrectnessCheck")]
    public required object AssertCorrectnessCheck { get; set; }
}
