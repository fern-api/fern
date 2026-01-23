using System.Text.Json;
using System.Text.Json.Serialization;
using SeedNullableOptional.Core;

namespace SeedNullableOptional;

/// <summary>
/// Test object with nullable enums, unions, and arrays
/// </summary>
[Serializable]
public record ComplexProfile : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("id")]
    public required string Id { get; set; }

    [JsonPropertyName("nullableRole")]
    public UserRole? NullableRole { get; set; }

    [JsonPropertyName("optionalRole")]
    public UserRole? OptionalRole { get; set; }

    [JsonPropertyName("optionalNullableRole")]
    public UserRole? OptionalNullableRole { get; set; }

    [JsonPropertyName("nullableStatus")]
    public UserStatus? NullableStatus { get; set; }

    [JsonPropertyName("optionalStatus")]
    public UserStatus? OptionalStatus { get; set; }

    [JsonPropertyName("optionalNullableStatus")]
    public UserStatus? OptionalNullableStatus { get; set; }

    [JsonPropertyName("nullableNotification")]
    public NotificationMethod? NullableNotification { get; set; }

    [JsonPropertyName("optionalNotification")]
    public NotificationMethod? OptionalNotification { get; set; }

    [JsonPropertyName("optionalNullableNotification")]
    public NotificationMethod? OptionalNullableNotification { get; set; }

    [JsonPropertyName("nullableSearchResult")]
    public SearchResult? NullableSearchResult { get; set; }

    [JsonPropertyName("optionalSearchResult")]
    public SearchResult? OptionalSearchResult { get; set; }

    [JsonPropertyName("nullableArray")]
    public IEnumerable<string>? NullableArray { get; set; }

    [JsonPropertyName("optionalArray")]
    public IEnumerable<string>? OptionalArray { get; set; }

    [JsonPropertyName("optionalNullableArray")]
    public IEnumerable<string>? OptionalNullableArray { get; set; }

    [JsonPropertyName("nullableListOfNullables")]
    public IEnumerable<string?>? NullableListOfNullables { get; set; }

    [JsonPropertyName("nullableMapOfNullables")]
    public Dictionary<string, Address>? NullableMapOfNullables { get; set; }

    [JsonPropertyName("nullableListOfUnions")]
    public IEnumerable<NotificationMethod>? NullableListOfUnions { get; set; }

    [JsonPropertyName("optionalMapOfEnums")]
    public Dictionary<string, UserRole>? OptionalMapOfEnums { get; set; }

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
