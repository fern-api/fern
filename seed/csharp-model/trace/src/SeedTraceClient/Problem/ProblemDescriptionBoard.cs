using SeedTraceClient
using System.Text.Json.Serialization
using OneOf

namespace SeedTraceClient

public class ProblemDescriptionBoard
{
    namespace SeedTraceClient

    public class Value
     : IBase{
        [JsonPropertyName("type")]
        public string Type { get; } = "html"
        ;
        
        [JsonPropertyName("value")]
        public string Value { get; init; }
    }
    
    namespace SeedTraceClient

    public class Value
     : IBase{
        [JsonPropertyName("type")]
        public string Type { get; } = "variable"
        ;
        
        [JsonPropertyName("value")]
        public OneOf<Value,Value,Value,Value,Value,MapValue,Value,BinaryTreeValue,SinglyLinkedListValue,DoublyLinkedListValue,NullValue> Value { get; init; }
    }
    
    namespace SeedTraceClient

    public class Value
     : IBase{
        [JsonPropertyName("type")]
        public string Type { get; } = "testCaseId"
        ;
        
        [JsonPropertyName("value")]
        public string Value { get; init; }
    }
    
    namespace SeedTraceClient

    private interface IBase
    {
    }
    
}
