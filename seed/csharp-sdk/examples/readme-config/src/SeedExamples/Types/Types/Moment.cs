using System.Text.Json;
using System.Text.Json.Serialization;
using SeedExamples.Core;

namespace SeedExamples;

public record Moment
{
    [JsonPropertyName("id")]
    public required string Id { get; set; }

    [JsonPropertyName("date")]
    public required DateOnly Date { get; set; }

    [JsonPropertyName("datetime")]
    public required DateTime Datetime { get; set; }

    /// <summary>
    /// Additional properties received from the response, if any.
    /// </summary>
    [JsonExtensionData]
    public IDictionary<string, JsonElement> AdditionalProperties =
        new Dictionary<string, JsonElement>();

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
