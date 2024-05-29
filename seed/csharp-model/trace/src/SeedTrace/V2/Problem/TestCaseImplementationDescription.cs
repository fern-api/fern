using System.Text.Json.Serialization;
using SeedTrace.V2;

#nullable enable

namespace SeedTrace.V2;

public class TestCaseImplementationDescription
{
    [JsonPropertyName("boards")]
    public List<TestCaseImplementationDescriptionBoard> Boards { get; init; }
}
