using System.Text.Json;
using System.Text.Json.Serialization;
using SeedExamples.Core;

namespace SeedExamples;

public record Response
{
    [JsonPropertyName("response")]
    public required object Response_ { get; set; }

    [JsonPropertyName("identifiers")]
    public IEnumerable<Identifier> Identifiers { get; set; } = new List<Identifier>();

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
