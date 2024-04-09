using System.Text.Json.Serialization;
using SeedTrace.V2;

namespace SeedTrace.V2;

public class TestCaseImplementation
{
    [JsonPropertyName("description")]
    public TestCaseImplementationDescription Description { get; init; }

    [JsonPropertyName("function")]
    public TestCaseFunction Function { get; init; }
}
