using System.Text.Json.Serialization;

#nullable enable

namespace SeedApi;

public record ImportingA
{
    [JsonPropertyName("a")]
    public A? A { get; set; }
}
