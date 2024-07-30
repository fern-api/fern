using System.Text.Json.Serialization;

#nullable enable

namespace SeedMultiLineDocs;

public record CreateUserRequest
{
    /// <summary>
    /// The name of the user to create.
    /// This name is unique to each user.
    ///
    /// </summary>
    [JsonPropertyName("name")]
    public required string Name { get; set; }

    /// <summary>
    /// The age of the user.
    /// This propery is not required.
    ///
    /// </summary>
    [JsonPropertyName("age")]
    public int? Age { get; set; }
}
