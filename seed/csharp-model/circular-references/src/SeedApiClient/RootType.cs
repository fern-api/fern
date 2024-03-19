using System.Text.Json.Serialization

namespace SeedApiClient

public class RootType
{
    [JsonPropertyName("s")]
    public string S { get; init; }
}
