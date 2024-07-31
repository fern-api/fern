using System.Text.Json.Serialization;
using SeedTrace.V2.V3;

#nullable enable

namespace SeedTrace.V2.V3;

public record VoidFunctionSignatureThatTakesActualResult
{
    [JsonPropertyName("parameters")]
    public IEnumerable<Parameter> Parameters { get; set; } = new List<Parameter>();

    [JsonPropertyName("actualResultType")]
    public required object ActualResultType { get; set; }
}
