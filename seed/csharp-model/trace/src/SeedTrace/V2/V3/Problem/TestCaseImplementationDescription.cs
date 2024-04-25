using System.Text.Json.Serialization;
using SeedTrace.V2.V3;

namespace SeedTrace.V2.V3;

public class TestCaseImplementationDescription
{
    [JsonPropertyName("boards")]
    public List<List<TestCaseImplementationDescriptionBoard>> Boards { get; init; }
}
