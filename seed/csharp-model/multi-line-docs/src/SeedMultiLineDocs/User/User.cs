using System.Text.Json.Serialization;

namespace SeedMultiLineDocs;

public class User
{
    [JsonPropertyName("id")]
    public string Id { get; init; }

    /// <summary>
    /// The user's name. This name is unique to each user. A few examples are included below:
    ///
    /// - Alice
    /// - Bob
    /// - Charlie
    /// </summary>
    [JsonPropertyName("name")]
    public string Name { get; init; }

    /// <summary>
    /// The user's age.
    /// </summary>
    [JsonPropertyName("age")]
    public int? Age { get; init; }
}
