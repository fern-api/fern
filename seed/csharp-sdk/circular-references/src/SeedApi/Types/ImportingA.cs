using System.Text.Json.Serialization;
using SeedApi;

#nullable enable

namespace SeedApi;

public class ImportingA
{
    [JsonPropertyName("a")]
    public A? A { get; init; }
}
