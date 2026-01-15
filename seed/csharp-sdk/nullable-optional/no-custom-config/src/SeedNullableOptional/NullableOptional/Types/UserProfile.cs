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

    [JsonPropertyName("nullableString")]
    public string? NullableString { get; set; }

    [JsonPropertyName("nullableInteger")]
    public int? NullableInteger { get; set; }

    [JsonPropertyName("nullableBoolean")]
    public bool? NullableBoolean { get; set; }

    [JsonPropertyName("nullableDate")]
    public DateTime? NullableDate { get; set; }

    [JsonPropertyName("nullableObject")]
    public Address? NullableObject { get; set; }

    [JsonPropertyName("nullableList")]
    public IEnumerable<string>? NullableList { get; set; }

    [JsonPropertyName("nullableMap")]
    public Dictionary<string, string>? NullableMap { get; set; }

    [JsonPropertyName("optionalString")]
    public string? OptionalString { get; set; }

    [JsonPropertyName("optionalInteger")]
    public int? OptionalInteger { get; set; }

    [JsonPropertyName("optionalBoolean")]
    public bool? OptionalBoolean { get; set; }

    [JsonPropertyName("optionalDate")]
    public DateTime? OptionalDate { get; set; }

    [JsonPropertyName("optionalObject")]
    public Address? OptionalObject { get; set; }

    [JsonPropertyName("optionalList")]
    public IEnumerable<string>? OptionalList { get; set; }

    [JsonPropertyName("optionalMap")]
    public Dictionary<string, string>? OptionalMap { get; set; }

    [JsonPropertyName("optionalNullableString")]
    public string? OptionalNullableString { get; set; }

    [JsonPropertyName("optionalNullableObject")]
    public Address? OptionalNullableObject { get; set; }

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
