using System.Text.Json.Serialization;

namespace Client;

public class RootType
{
    [JsonPropertyName("s")]
    public string S { get; init; }
}
