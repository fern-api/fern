using System.Text.Json;
using System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record Foo : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [Optional]
    [JsonPropertyName("bar")]
    public string? Bar { get; set; }

    [Nullable, Optional]
    [JsonPropertyName("nullable_bar")]
    public Optional<string?> NullableBar { get; set; }

    [Nullable]
    [JsonPropertyName("nullable_required_bar")]
    public string? NullableRequiredBar { get; set; }

    [JsonPropertyName("required_bar")]
    public required string RequiredBar { get; set; }

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
