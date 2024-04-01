using System.Text.Json.Serialization;

namespace SeedApi;

public class RootType
{
    [JsonPropertyName("s")]
    public string S { get; init; }
}
