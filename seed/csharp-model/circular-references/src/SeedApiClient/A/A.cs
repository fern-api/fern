using System.Text.Json.Serialization

namespace SeedApiClient

public class A
{
    [JsonPropertyName("s")]
    public string S { get; init; }
}
