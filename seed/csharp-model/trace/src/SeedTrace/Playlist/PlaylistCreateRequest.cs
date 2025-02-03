using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

public record PlaylistCreateRequest
{
    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("problems")]
    public IEnumerable<string> Problems { get; set; } = new List<string>();

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
