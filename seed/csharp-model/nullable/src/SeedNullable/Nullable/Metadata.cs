using System.Text.Json;
using System.Text.Json.Serialization;
using SeedNullable.Core;

namespace SeedNullable;

public record Metadata
{
    [JsonPropertyName("createdAt")]
    public required DateTime CreatedAt { get; set; }

    [JsonPropertyName("updatedAt")]
    public required DateTime UpdatedAt { get; set; }

    [JsonPropertyName("avatar")]
    public string? Avatar { get; set; }

    [JsonPropertyName("activated")]
    public bool? Activated { get; set; }

    [JsonPropertyName("status")]
    public required object Status { get; set; }

    [JsonPropertyName("values")]
    public Dictionary<string, string?>? Values { get; set; }

    /// <summary>
    /// Additional properties received from the response, if any.
    /// </summary>
    /// <remarks>
    /// [EXPERIMENTAL] This API is experimental and may change in future releases.
    /// </remarks>
    [JsonExtensionData]
    public IDictionary<string, JsonElement> AdditionalProperties { get; internal set; } =
        new Dictionary<string, JsonElement>();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
