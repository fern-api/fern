using System.Text.Json;
using System.Text.Json.Serialization;
using SeedRequestParameters.Core;

namespace SeedRequestParameters;

[Serializable]
public record CreateUsernameBodyOptionalProperties : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [Optional]
    [JsonPropertyName("username")]
    public string? Username { get; set; }

    [Optional]
    [JsonPropertyName("password")]
    public string? Password { get; set; }

    [Optional]
    [JsonPropertyName("name")]
    public string? Name { get; set; }

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
