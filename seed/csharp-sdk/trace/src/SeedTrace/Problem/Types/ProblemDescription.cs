using System.Text.Json.Serialization;
using OneOf;
using SeedTrace;

namespace SeedTrace;

public class ProblemDescription
{
    [JsonPropertyName("boards")]
    public List<OneOf<ProblemDescriptionBoard._Html, ProblemDescriptionBoard._Variable, ProblemDescriptionBoard._TestCaseId>> Boards { get; init; }
}
