using System.Text.Json;
using System.Text.Json.Serialization;
using SeedMultiLineDocs.Core;

namespace SeedMultiLineDocs;

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
    [JsonExtensionData]
    public IDictionary<string, JsonElement> AdditionalProperties =
        new Dictionary<string, JsonElement>();

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
