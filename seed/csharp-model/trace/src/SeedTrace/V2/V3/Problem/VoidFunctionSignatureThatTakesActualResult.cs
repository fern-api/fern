using System.Text.Json.Serialization;
using SeedTrace;
using SeedTrace.V2.V3;

namespace SeedTrace.V2.V3;

public class VoidFunctionSignatureThatTakesActualResult
{
    [JsonPropertyName("parameters")]
    public List<List<Parameter>> Parameters { get; init; }

    [JsonPropertyName("actualResultType")]
    public VariableType ActualResultType { get; init; }
}
