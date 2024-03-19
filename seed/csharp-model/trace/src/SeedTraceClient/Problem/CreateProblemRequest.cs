using System.Text.Json.Serialization
using SeedTraceClient
using StringEnum
using OneOf

namespace SeedTraceClient

public class CreateProblemRequest
{
    [JsonPropertyName("problemName")]
    public string ProblemName { get; init; }
    [JsonPropertyName("problemDescription")]
    public ProblemDescription ProblemDescription { get; init; }
    [JsonPropertyName("files")]
    public Dictionary<StringEnum<Language>,ProblemFiles> Files { get; init; }
    [JsonPropertyName("inputParams")]
    public List<VariableTypeAndName> InputParams { get; init; }
    [JsonPropertyName("outputType")]
    public OneOf<IntegerType,DoubleType,BooleanType,StringType,CharType,ListType,MapType,BinaryTreeType,SinglyLinkedListType,DoublyLinkedListType> OutputType { get; init; }
    [JsonPropertyName("testcases")]
    public List<TestCaseWithExpectedResult> Testcases { get; init; }
    [JsonPropertyName("methodName")]
    public string MethodName { get; init; }
}
