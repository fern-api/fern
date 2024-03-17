using System.Text.Json.Serialization

namespace test.Types

public class Cat
{
    [JsonPropertyName("name")]
    public string Name { get; init; }
    [JsonPropertyName("likesToMeow")]
    public bool LikesToMeow { get; init; }
}
