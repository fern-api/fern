using System.Text.Json.Serialization;
using SeedTrace;

#nullable enable

namespace SeedTrace;

public class ProblemDescription
{
    [JsonPropertyName("boards")]
    public List<ProblemDescriptionBoard> Boards { get; init; }
}
