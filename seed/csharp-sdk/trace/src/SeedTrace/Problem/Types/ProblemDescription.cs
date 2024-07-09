using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public record ProblemDescription
{
    [JsonPropertyName("boards")]
    public IEnumerable<object> Boards { get; init; } = new List<object>();
}
