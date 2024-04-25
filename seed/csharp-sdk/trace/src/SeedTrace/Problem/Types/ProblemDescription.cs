using System.Text.Json.Serialization;
using SeedTrace;

namespace SeedTrace;

public class ProblemDescription
{
    [JsonPropertyName("boards")]
    public List<List<ProblemDescriptionBoard>> Boards { get; init; }
}
