using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace.V2;

public record TestCaseMetadata
{
    [JsonPropertyName("id")]
    public required string Id { get; set; }

    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("hidden")]
    public required bool Hidden { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
