using System.Text.Json;
using System.Text.Json.Serialization;
using SeedNullableOptional.Core;

namespace SeedNullableOptional;

/// <summary>
/// Request body for testing deserialization of null values
/// </summary>
[Serializable]
public record DeserializationTestRequest : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("requiredString")]
    public required string RequiredString { get; set; }

    [Nullable]
    [JsonPropertyName("nullableString")]
    public string? NullableString { get; set; }

    [Optional]
    [JsonPropertyName("optionalString")]
    public string? OptionalString { get; set; }

    [Nullable, Optional]
    [JsonPropertyName("optionalNullableString")]
    public Optional<string?> OptionalNullableString { get; set; }

    [Nullable]
    [JsonPropertyName("nullableEnum")]
    public UserRole? NullableEnum { get; set; }

    [Optional]
    [JsonPropertyName("optionalEnum")]
    public UserStatus? OptionalEnum { get; set; }

    [Nullable]
    [JsonPropertyName("nullableUnion")]
    public NotificationMethod? NullableUnion { get; set; }

    [Optional]
    [JsonPropertyName("optionalUnion")]
    public SearchResult? OptionalUnion { get; set; }

    [Nullable]
    [JsonPropertyName("nullableList")]
    public IEnumerable<string>? NullableList { get; set; }

    [Nullable]
    [JsonPropertyName("nullableMap")]
    public Dictionary<string, int>? NullableMap { get; set; }

    [Nullable]
    [JsonPropertyName("nullableObject")]
    public Address? NullableObject { get; set; }

    [Optional]
    [JsonPropertyName("optionalObject")]
    public Organization? OptionalObject { get; set; }

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
