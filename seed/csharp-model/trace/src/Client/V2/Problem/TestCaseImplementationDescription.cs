using System.Text.Json.Serialization;
using OneOf;
using Client.V2;

namespace Client.V2;

public class TestCaseImplementationDescription
{
    [JsonPropertyName("boards")]
    public List<OneOf<TestCaseImplementationDescriptionBoard._Html, TestCaseImplementationDescriptionBoard._ParamId>> Boards { get; init; }
}
