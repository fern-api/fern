using System.Text.Json;
using System.Text.Json.Serialization;
using OneOf;
using SeedNullable.Core;

namespace SeedNullable;

public record User
{
    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("id")]
    public required string Id { get; set; }

    [JsonPropertyName("tags")]
    public IEnumerable<string>? Tags { get; set; }

    [JsonPropertyName("metadata")]
    public Metadata? Metadata { get; set; }

    [JsonPropertyName("email")]
    public string? Email { get; set; }

    [JsonPropertyName("favorite-number")]
    public required OneOf<int, float?, string?, double> FavoriteNumber { get; set; }

    [JsonPropertyName("numbers")]
    public IEnumerable<int>? Numbers { get; set; }

    [JsonPropertyName("strings")]
    public object? Strings { get; set; }

    /// <summary>
    /// Additional properties received from the response, if any.
    /// </summary>
    [JsonExtensionData]
    public IDictionary<string, JsonElement> AdditionalProperties { get; internal set; } =
        new Dictionary<string, JsonElement>();

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
