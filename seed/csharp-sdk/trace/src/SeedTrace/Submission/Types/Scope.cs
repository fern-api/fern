using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

public record Scope
{
    [JsonPropertyName("variables")]
    public object Variables { get; set; } = new Dictionary<string, object?>();

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
