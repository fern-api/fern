using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public class ProblemDescription
{
    [JsonPropertyName("boards")]
    public IEnumerable<object> Boards { get; init; }
}
