using System.Text.Json.Serialization;

#nullable enable

namespace SeedApi;

public class A
{
    [JsonPropertyName("s")]
    public string S { get; init; }
}
