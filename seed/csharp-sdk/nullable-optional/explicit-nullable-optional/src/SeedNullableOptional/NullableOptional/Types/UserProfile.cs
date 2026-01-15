using System.Text.Json;
using System.Text.Json.Serialization;
using SeedNullableOptional.Core;

namespace SeedNullableOptional;

/// <summary>
/// Test object with nullable and optional fields
/// </summary>
[Serializable]
public record UserProfile : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("id")]
    public required string Id { get; set; }

    [JsonPropertyName("username")]
    public required string Username { get; set; }

    [Nullable]
    [JsonPropertyName("nullableString")]
    public string? NullableString { get; set; }

    [Nullable]
    [JsonPropertyName("nullableInteger")]
    public int? NullableInteger { get; set; }

    [Nullable]
    [JsonPropertyName("nullableBoolean")]
    public bool? NullableBoolean { get; set; }

    [Nullable]
    [JsonPropertyName("nullableDate")]
    public DateTime? NullableDate { get; set; }

    [Nullable]
    [JsonPropertyName("nullableObject")]
    public Address? NullableObject { get; set; }

    [Nullable]
    [JsonPropertyName("nullableList")]
    public IEnumerable<string>? NullableList { get; set; }

    [Nullable]
    [JsonPropertyName("nullableMap")]
    public Dictionary<string, string>? NullableMap { get; set; }

    [Optional]
    [JsonPropertyName("optionalString")]
    public string? OptionalString { get; set; }

    [Optional]
    [JsonPropertyName("optionalInteger")]
    public int? OptionalInteger { get; set; }

    [Optional]
    [JsonPropertyName("optionalBoolean")]
    public bool? OptionalBoolean { get; set; }

    [Optional]
    [JsonPropertyName("optionalDate")]
    public DateTime? OptionalDate { get; set; }

    [Optional]
    [JsonPropertyName("optionalObject")]
    public Address? OptionalObject { get; set; }

    [Optional]
    [JsonPropertyName("optionalList")]
    public IEnumerable<string>? OptionalList { get; set; }

    [Optional]
    [JsonPropertyName("optionalMap")]
    public Dictionary<string, string>? OptionalMap { get; set; }

    [Nullable, Optional]
    [JsonPropertyName("optionalNullableString")]
    public Optional<string?> OptionalNullableString { get; set; }

    [Nullable, Optional]
    [JsonPropertyName("optionalNullableObject")]
    public Optional<Address?> OptionalNullableObject { get; set; }

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
