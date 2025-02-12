using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace.V2;

public record TestCaseWithActualResultImplementation
{
    [JsonPropertyName("getActualResult")]
    public required NonVoidFunctionDefinition GetActualResult { get; set; }

    [JsonPropertyName("assertCorrectnessCheck")]
    public required object AssertCorrectnessCheck { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
