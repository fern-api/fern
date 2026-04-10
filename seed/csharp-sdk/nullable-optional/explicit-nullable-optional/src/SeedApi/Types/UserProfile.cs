using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

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

    [JsonPropertyName("nullableObject")]
    public required Address NullableObject { get; set; }

    [Nullable]
    [JsonPropertyName("nullableList")]
    public IEnumerable<string>? NullableList { get; set; }

    [Nullable]
    [JsonPropertyName("nullableMap")]
    public Dictionary<string, string?>? NullableMap { get; set; }

    [Nullable, Optional]
    [JsonPropertyName("optionalString")]
    public Optional<string?> OptionalString { get; set; }

    [Nullable, Optional]
    [JsonPropertyName("optionalInteger")]
    public Optional<int?> OptionalInteger { get; set; }

    [Nullable, Optional]
    [JsonPropertyName("optionalBoolean")]
    public Optional<bool?> OptionalBoolean { get; set; }

    [Nullable, Optional]
    [JsonPropertyName("optionalDate")]
    public Optional<DateTime?> OptionalDate { get; set; }

    [Optional]
    [JsonPropertyName("optionalObject")]
    public Address? OptionalObject { get; set; }

    [Nullable, Optional]
    [JsonPropertyName("optionalList")]
    public Optional<IEnumerable<string>?> OptionalList { get; set; }

    [Nullable, Optional]
    [JsonPropertyName("optionalMap")]
    public Optional<Dictionary<string, string?>?> OptionalMap { get; set; }

    [Nullable, Optional]
    [JsonPropertyName("optionalNullableString")]
    public Optional<string?> OptionalNullableString { get; set; }

    [Optional]
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
