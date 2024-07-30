using System.Text.Json.Serialization;
using SeedApi;

#nullable enable

namespace SeedApi;

public record A : RootType
{
    [JsonPropertyName("s")]
    public required string S { get; set; }
}
