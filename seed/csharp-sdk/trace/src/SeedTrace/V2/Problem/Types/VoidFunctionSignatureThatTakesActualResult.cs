using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace.V2;

public record VoidFunctionSignatureThatTakesActualResult
{
    [JsonPropertyName("parameters")]
    public IEnumerable<Parameter> Parameters { get; set; } = new List<Parameter>();

    [JsonPropertyName("actualResultType")]
    public required object ActualResultType { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
