using System.Text.Json.Serialization
using SeedApiClient

namespace SeedApiClient

public class ImportingA
{
    [JsonPropertyName("a")]
    public A? A { get; init; }
}
