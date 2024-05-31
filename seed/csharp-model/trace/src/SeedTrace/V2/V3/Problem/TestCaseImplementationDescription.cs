using System.Text.Json.Serialization;
using SeedTrace.V2.V3;

#nullable enable

namespace SeedTrace.V2.V3;

public class TestCaseImplementationDescription
{
    [JsonPropertyName("boards")]
    public IEnumerable<TestCaseImplementationDescriptionBoard> Boards { get; init; }
}
