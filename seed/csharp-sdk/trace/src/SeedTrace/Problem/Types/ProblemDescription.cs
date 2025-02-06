using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

public record ProblemDescription
{
    [JsonPropertyName("boards")]
    public IEnumerable<object> Boards { get; set; } = new List<object>();

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
