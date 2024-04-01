using System.Text.Json.Serialization;
using SeedApi;

namespace SeedApi;

public class ImportingA
{
    [JsonPropertyName("a")]
    public A? A { get; init; }
}
