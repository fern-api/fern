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

    [Nullable]
    [JsonPropertyName("nullableRole")]
    public UserRole? NullableRole { get; set; }

    [Optional]
    [JsonPropertyName("optionalRole")]
    public UserRole? OptionalRole { get; set; }

    [Nullable, Optional]
    [JsonPropertyName("optionalNullableRole")]
    public Optional<UserRole?> OptionalNullableRole { get; set; }

    [Nullable]
    [JsonPropertyName("nullableStatus")]
    public UserStatus? NullableStatus { get; set; }

    [Optional]
    [JsonPropertyName("optionalStatus")]
    public UserStatus? OptionalStatus { get; set; }

    [Nullable, Optional]
    [JsonPropertyName("optionalNullableStatus")]
    public Optional<UserStatus?> OptionalNullableStatus { get; set; }

    [Nullable]
    [JsonPropertyName("nullableNotification")]
    public NotificationMethod? NullableNotification { get; set; }

    [Optional]
    [JsonPropertyName("optionalNotification")]
    public NotificationMethod? OptionalNotification { get; set; }

    [Nullable, Optional]
    [JsonPropertyName("optionalNullableNotification")]
    public Optional<NotificationMethod?> OptionalNullableNotification { get; set; }

    [Nullable]
    [JsonPropertyName("nullableSearchResult")]
    public SearchResult? NullableSearchResult { get; set; }

    [Optional]
    [JsonPropertyName("optionalSearchResult")]
    public SearchResult? OptionalSearchResult { get; set; }

    [Nullable]
    [JsonPropertyName("nullableArray")]
    public IEnumerable<string>? NullableArray { get; set; }

    [Optional]
    [JsonPropertyName("optionalArray")]
    public IEnumerable<string>? OptionalArray { get; set; }

    [Nullable, Optional]
    [JsonPropertyName("optionalNullableArray")]
    public Optional<IEnumerable<string>?> OptionalNullableArray { get; set; }

    [Nullable]
    [JsonPropertyName("nullableListOfNullables")]
    public IEnumerable<string?>? NullableListOfNullables { get; set; }

    [Nullable]
    [JsonPropertyName("nullableMapOfNullables")]
    public Dictionary<string, Address?>? NullableMapOfNullables { get; set; }

    [Nullable]
    [JsonPropertyName("nullableListOfUnions")]
    public IEnumerable<NotificationMethod>? NullableListOfUnions { get; set; }

    [Optional]
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
