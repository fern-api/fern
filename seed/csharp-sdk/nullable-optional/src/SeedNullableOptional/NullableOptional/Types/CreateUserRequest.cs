using System.Text.Json;
using System.Text.Json.Serialization;
using SeedNullableOptional.Core;

namespace SeedNullableOptional;

[Serializable]
public record CreateUserRequest : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("username")]
    public required string Username { get; set; }

    [Nullable]
    [JsonPropertyName("email")]
    public string? Email { get; set; }

    [Optional]
    [JsonPropertyName("phone")]
    public string? Phone { get; set; }

    [Nullable, Optional]
    [JsonPropertyName("address")]
    public Optional<Address?> Address { get; set; }

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
