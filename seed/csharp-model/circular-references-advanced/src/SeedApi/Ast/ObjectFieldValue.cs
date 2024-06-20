using System.Text.Json.Serialization;

#nullable enable

namespace SeedApi;

public class ObjectFieldValue
{
    [JsonPropertyName("name")]
    public string Name { get; init; }

    [JsonPropertyName("value")]
    public object Value { get; init; }
}
