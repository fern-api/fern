using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using OneOf;
using SeedApi.Core;

namespace SeedApi;

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

    [JsonPropertyName("nullableString")]
    public string? NullableString { get; set; }

    [JsonPropertyName("optionalString")]
    public string? OptionalString { get; set; }

    [JsonPropertyName("optionalNullableString")]
    public string? OptionalNullableString { get; set; }

    [JsonPropertyName("nullableEnum")]
    public required UserRole NullableEnum { get; set; }

    [JsonPropertyName("optionalEnum")]
    public UserStatus? OptionalEnum { get; set; }

    [JsonPropertyName("nullableUnion")]
    public required OneOf<
        NotificationMethodZero,
        NotificationMethodOne,
        NotificationMethodTwo
    > NullableUnion { get; set; }

    [JsonPropertyName("optionalUnion")]
    public OneOf<SearchResultZero, SearchResultOne, SearchResultTwo>? OptionalUnion { get; set; }

    [JsonPropertyName("nullableList")]
    public IEnumerable<string>? NullableList { get; set; }

    [JsonPropertyName("nullableMap")]
    public Dictionary<string, int?>? NullableMap { get; set; }

    [JsonPropertyName("nullableObject")]
    public required Address NullableObject { get; set; }

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
