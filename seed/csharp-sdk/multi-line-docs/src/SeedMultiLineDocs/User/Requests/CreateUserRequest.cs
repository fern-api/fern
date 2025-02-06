using System.Text.Json.Serialization;
using SeedMultiLineDocs.Core;

namespace SeedMultiLineDocs;

public record CreateUserRequest
{
    /// <summary>
    /// The name of the user to create.
    /// This name is unique to each user.
    /// </summary>
    [JsonPropertyName("name")]
    public required string Name { get; set; }

    /// <summary>
    /// The age of the user.
    /// This property is not required.
    /// </summary>
    [JsonPropertyName("age")]
    public int? Age { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
