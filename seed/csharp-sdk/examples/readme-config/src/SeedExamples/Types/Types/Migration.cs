using System.Text.Json;
using System.Text.Json.Serialization;
using SeedExamples.Core;

namespace SeedExamples;

public record Migration
{
    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("status")]
    public required MigrationStatus Status { get; set; }

    /// <summary>
    /// Additional properties received from the response, if any.
    /// </summary>
    [JsonExtensionData]
    public IDictionary<string, JsonElement> AdditionalProperties { get; internal set; } =
        new Dictionary<string, JsonElement>();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
