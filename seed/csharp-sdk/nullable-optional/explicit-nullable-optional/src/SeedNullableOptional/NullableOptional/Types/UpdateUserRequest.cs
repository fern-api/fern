using System.Text.Json;
using System.Text.Json.Serialization;
using SeedNullableOptional.Core;

namespace SeedNullableOptional;

/// <summary>
/// For testing PATCH operations
/// </summary>
[Serializable]
public record UpdateUserRequest : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [Optional]
    [JsonPropertyName("username")]
    public string? Username { get; set; }

    [Nullable, Optional]
    [JsonPropertyName("email")]
    public Optional<string?> Email { get; set; }

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
