using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

public record TestCase
{
    [JsonPropertyName("id")]
    public required string Id { get; set; }

    [JsonPropertyName("params")]
    public IEnumerable<object> Params { get; set; } = new List<object>();

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
