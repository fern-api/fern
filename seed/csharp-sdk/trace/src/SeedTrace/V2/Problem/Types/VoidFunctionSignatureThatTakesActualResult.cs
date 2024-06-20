using System.Text.Json.Serialization;
using SeedTrace.V2;

#nullable enable

namespace SeedTrace.V2;

public class VoidFunctionSignatureThatTakesActualResult
{
    [JsonPropertyName("parameters")]
    public IEnumerable<Parameter> Parameters { get; init; }

    [JsonPropertyName("actualResultType")]
    public object ActualResultType { get; init; }
}
