using System.Text.Json;
using System.Text.Json.Serialization;
using OneOf;
using SeedNullable.Core;

namespace SeedNullable;

[Serializable]
public record User : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("id")]
    public required string Id { get; set; }

    [Nullable]
    [JsonPropertyName("tags")]
    public IEnumerable<string>? Tags { get; set; }

    [Nullable, Optional]
    [JsonPropertyName("metadata")]
    public Optional<Metadata?> Metadata { get; set; }

    [Nullable]
    [JsonPropertyName("email")]
    public string? Email { get; set; }

    [JsonPropertyName("favorite-number")]
    public required OneOf<int, float?, Optional<string?>, double> FavoriteNumber { get; set; }

    [Nullable, Optional]
    [JsonPropertyName("numbers")]
    public Optional<IEnumerable<int>?> Numbers { get; set; }

    [Nullable, Optional]
    [JsonPropertyName("strings")]
    public Optional<Dictionary<string, object?>?> Strings { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    void IJsonOnDeserialized.OnDeserialized() =>
        AdditionalProperties.CopyFromExtensionData(_extensionData);

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
