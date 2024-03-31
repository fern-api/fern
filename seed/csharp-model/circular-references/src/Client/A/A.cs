using System.Text.Json.Serialization;

namespace Client;

public class A
{
    [JsonPropertyName("s")]
    public string S { get; init; }
}
