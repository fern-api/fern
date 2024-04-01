using System.Text.Json.Serialization;
using OneOf;
using SeedTrace.V2.V3;

namespace SeedTrace.V2.V3;

public class TestCaseImplementationDescription
{
    [JsonPropertyName("boards")]
    public List<OneOf<TestCaseImplementationDescriptionBoard._Html, TestCaseImplementationDescriptionBoard._ParamId>> Boards { get; init; }
}
