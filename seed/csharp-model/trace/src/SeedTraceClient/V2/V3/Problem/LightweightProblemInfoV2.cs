using System.Text.Json.Serialization
using OneOf
using SeedTraceClient

namespace SeedTraceClient.V2.V3

public class LightweightProblemInfoV2
{
    [JsonPropertyName("problemId")]
    public string ProblemId { get; init; }
    [JsonPropertyName("problemName")]
    public string ProblemName { get; init; }
    [JsonPropertyName("problemVersion")]
    public int ProblemVersion { get; init; }
    [JsonPropertyName("variableTypes")]
    public HashSet<OneOf<IntegerType,DoubleType,BooleanType,StringType,CharType,ListType,MapType,BinaryTreeType,SinglyLinkedListType,DoublyLinkedListType>> VariableTypes { get; init; }
}
