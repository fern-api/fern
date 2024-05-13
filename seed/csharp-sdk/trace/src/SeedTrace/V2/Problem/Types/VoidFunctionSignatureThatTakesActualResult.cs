using System.Text.Json.Serialization;
using SeedTrace;
using SeedTrace.V2;

namespace SeedTrace.V2;

public class VoidFunctionSignatureThatTakesActualResult
{
    [JsonPropertyName("parameters")]
    public List<Parameter> Parameters { get; init; }

    [JsonPropertyName("actualResultType")]
    public VariableType ActualResultType { get; init; }
}
