using System.Text.Json.Serialization;
using SeedApi;

namespace SeedApi;

public class ImportingA
{
    [JsonPropertyName("a")]
    public List<A?> A { get; init; }
}
