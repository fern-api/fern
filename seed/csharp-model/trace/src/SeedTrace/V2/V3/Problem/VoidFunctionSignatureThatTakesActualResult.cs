using System.Text.Json.Serialization;
using SeedTrace.V2.V3;

#nullable enable

namespace SeedTrace.V2.V3;

public class VoidFunctionSignatureThatTakesActualResult
{
    [JsonPropertyName("parameters")]
    public IEnumerable<Parameter> Parameters { get; init; }

    [JsonPropertyName("actualResultType")]
    public object ActualResultType { get; init; }
}
