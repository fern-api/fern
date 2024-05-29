using System.Text.Json.Serialization;

#nullable enable

namespace SeedApi;

public class RootType
{
    [JsonPropertyName("s")]
    public string S { get; init; }
}
