using System.Text.Json.Serialization;
using SeedTrace;
using OneOf;

namespace SeedTrace;

public class ProblemInfo
{
    [JsonPropertyName("problemId")]
    public string ProblemId { get; init; }

    [JsonPropertyName("problemDescription")]
    public ProblemDescription ProblemDescription { get; init; }

    [JsonPropertyName("problemName")]
    public string ProblemName { get; init; }

    [JsonPropertyName("problemVersion")]
    public int ProblemVersion { get; init; }

    [JsonPropertyName("files")]
    public Dictionary<Language, ProblemFiles> Files { get; init; }

    [JsonPropertyName("inputParams")]
    public List<VariableTypeAndName> InputParams { get; init; }

    [JsonPropertyName("outputType")]
    public OneOf<VariableType._IntegerType, VariableType._DoubleType, VariableType._BooleanType, VariableType._StringType, VariableType._CharType, VariableType._ListType, VariableType._MapType, VariableType._BinaryTreeType, VariableType._SinglyLinkedListType, VariableType._DoublyLinkedListType> OutputType { get; init; }

    [JsonPropertyName("testcases")]
    public List<TestCaseWithExpectedResult> Testcases { get; init; }

    [JsonPropertyName("methodName")]
    public string MethodName { get; init; }

    [JsonPropertyName("supportsCustomTestCases")]
    public bool SupportsCustomTestCases { get; init; }
}
