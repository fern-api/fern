using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using OneOf;
using SeedApi.Core;

namespace SeedApi;

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
    public required UserRole NullableRole { get; set; }

    [Optional]
    [JsonPropertyName("optionalRole")]
    public UserRole? OptionalRole { get; set; }

    [Optional]
    [JsonPropertyName("optionalNullableRole")]
    public UserRole? OptionalNullableRole { get; set; }

    [JsonPropertyName("nullableStatus")]
    public required UserStatus NullableStatus { get; set; }

    [Optional]
    [JsonPropertyName("optionalStatus")]
    public UserStatus? OptionalStatus { get; set; }

    [Optional]
    [JsonPropertyName("optionalNullableStatus")]
    public UserStatus? OptionalNullableStatus { get; set; }

    [JsonPropertyName("nullableNotification")]
    public required OneOf<
        NotificationMethodZero,
        NotificationMethodOne,
        NotificationMethodTwo
    > NullableNotification { get; set; }

    [Optional]
    [JsonPropertyName("optionalNotification")]
    public OneOf<
        NotificationMethodZero,
        NotificationMethodOne,
        NotificationMethodTwo
    >? OptionalNotification { get; set; }

    [Optional]
    [JsonPropertyName("optionalNullableNotification")]
    public OneOf<
        NotificationMethodZero,
        NotificationMethodOne,
        NotificationMethodTwo
    >? OptionalNullableNotification { get; set; }

    [JsonPropertyName("nullableSearchResult")]
    public required OneOf<
        SearchResultZero,
        SearchResultOne,
        SearchResultTwo
    > NullableSearchResult { get; set; }

    [Optional]
    [JsonPropertyName("optionalSearchResult")]
    public OneOf<
        SearchResultZero,
        SearchResultOne,
        SearchResultTwo
    >? OptionalSearchResult { get; set; }

    [Nullable]
    [JsonPropertyName("nullableArray")]
    public IEnumerable<string>? NullableArray { get; set; }

    [Nullable, Optional]
    [JsonPropertyName("optionalArray")]
    public Optional<IEnumerable<string>?> OptionalArray { get; set; }

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
    public IEnumerable<
        OneOf<NotificationMethodZero, NotificationMethodOne, NotificationMethodTwo>
    >? NullableListOfUnions { get; set; }

    [Nullable, Optional]
    [JsonPropertyName("optionalMapOfEnums")]
    public Optional<Dictionary<string, UserRole?>?> OptionalMapOfEnums { get; set; }

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
