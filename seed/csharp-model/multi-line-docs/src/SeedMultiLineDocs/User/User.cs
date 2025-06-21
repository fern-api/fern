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
public record User
{
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

    /// <summary>
    /// Additional properties received from the response, if any.
    /// </summary>
    /// <remarks>
    /// [EXPERIMENTAL] This API is experimental and may change in future releases.
    /// </remarks>
    [JsonExtensionData]
    public IDictionary<string, JsonElement> AdditionalProperties { get; internal set; } =
        new Dictionary<string, JsonElement>();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
