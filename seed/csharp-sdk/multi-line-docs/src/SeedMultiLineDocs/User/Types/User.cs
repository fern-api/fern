using System.Text.Json;
using System.Text.Json.Serialization;
using SeedMultiLineDocs.Core;

namespace SeedMultiLineDocs;

/// <summary>
/// A user object. This type is used throughout the following APIs:
///   - createUser
///   - getUser
/// </summary>
[Serializable]
public record User : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("id")]
    public required string Id { get; set; }

    /// <summary>
    /// The user's name. This name is unique to each user. A few examples are included below:
    ///  - Alice
    ///  - Bob
    ///  - Charlie
    /// </summary>
    [JsonPropertyName("name")]
    public required string Name { get; set; }

    /// <summary>
    /// The user's age.
    /// </summary>
    [JsonPropertyName("age")]
    public int? Age { get; set; }

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
