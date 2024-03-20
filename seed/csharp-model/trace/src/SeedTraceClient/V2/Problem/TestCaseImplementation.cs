using System.Text.Json.Serialization
using SeedTraceClient.V2
using OneOf

namespace SeedTraceClient.V2

public class TestCaseImplementation
{
    [JsonPropertyName("description")]
    public TestCaseImplementationDescription Description { get; init; }

    [JsonPropertyName("function")]
    public OneOf<TestCaseWithActualResultImplementation, VoidFunctionDefinition> Function { get; init; }
}
