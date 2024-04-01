using System.Text.Json.Serialization;
using Client;

namespace Client;

public class ImportingA
{
    [JsonPropertyName("a")]
    public A? A { get; init; }
}
