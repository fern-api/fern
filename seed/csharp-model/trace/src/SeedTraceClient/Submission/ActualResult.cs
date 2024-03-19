using SeedTraceClient
using System.Text.Json.Serialization
using OneOf

namespace SeedTraceClient

public class ActualResult
{
    namespace SeedTraceClient

    public class Value
     : IBase{
        [JsonPropertyName("type")]
        public string Type { get; } = "value"
        ;
        
        [JsonPropertyName("value")]
        public OneOf<Value,Value,Value,Value,Value,MapValue,Value,BinaryTreeValue,SinglyLinkedListValue,DoublyLinkedListValue,NullValue> Value { get; init; }
    }
    
    namespace SeedTraceClient

    public class ExceptionInfo
     : ExceptionInfo, IBase{
        [JsonPropertyName("type")]
        public string Type { get; } = "exception"
        ;
        
    }
    
    namespace SeedTraceClient

    public class Value
     : IBase{
        [JsonPropertyName("type")]
        public string Type { get; } = "exceptionV2"
        ;
        
        [JsonPropertyName("value")]
        public OneOf<ExceptionInfo,Timeout> Value { get; init; }
    }
    
    namespace SeedTraceClient

    private interface IBase
    {
    }
    
}
