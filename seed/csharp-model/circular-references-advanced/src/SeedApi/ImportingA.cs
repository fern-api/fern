using System.Text.Json.Serialization;
using SeedApi;

#nullable enable

namespace SeedApi;

public record ImportingA
{
    [JsonPropertyName("a")]
    public A? A { get; set; }
}
