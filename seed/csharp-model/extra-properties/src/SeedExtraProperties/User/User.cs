using System.Text.Json.Serialization;

#nullable enable

namespace SeedExtraProperties;

public class User
{
    [JsonPropertyName("name")]
    public string Name { get; init; }
}
