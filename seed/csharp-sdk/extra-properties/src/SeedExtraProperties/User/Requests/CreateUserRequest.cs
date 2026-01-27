using System.Text.Json.Serialization;
using SeedExtraProperties.Core;

namespace SeedExtraProperties;

[Serializable]
public record CreateUserRequest : IJsonOnDeserialized, IJsonOnSerializing
{
    [JsonExtensionData]
    private readonly IDictionary<string, object?> _extensionData =
        new Dictionary<string, object?>();

    [JsonPropertyName("_type")]
    public string Type { get; set; } = "CreateUserRequest";

    [JsonPropertyName("_version")]
    public string Version { get; set; } = "v1";

    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonIgnore]
    public AdditionalProperties AdditionalProperties { get; set; } = new();

    void IJsonOnDeserialized.OnDeserialized() =>
        AdditionalProperties.CopyFromExtensionData(_extensionData);

    void IJsonOnSerializing.OnSerializing() =>
        AdditionalProperties.CopyToExtensionData(_extensionData);

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
