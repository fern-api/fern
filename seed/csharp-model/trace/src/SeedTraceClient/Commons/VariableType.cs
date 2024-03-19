using SeedTraceClient
using System.Text.Json.Serialization

namespace SeedTraceClient

public class VariableType
{
    namespace SeedTraceClient

    public class IntegerType
     : IBase{
        [JsonPropertyName("type")]
        public string Type { get; } = "integerType"
        ;
        
    }
    
    namespace SeedTraceClient

    public class DoubleType
     : IBase{
        [JsonPropertyName("type")]
        public string Type { get; } = "doubleType"
        ;
        
    }
    
    namespace SeedTraceClient

    public class BooleanType
     : IBase{
        [JsonPropertyName("type")]
        public string Type { get; } = "booleanType"
        ;
        
    }
    
    namespace SeedTraceClient

    public class StringType
     : IBase{
        [JsonPropertyName("type")]
        public string Type { get; } = "stringType"
        ;
        
    }
    
    namespace SeedTraceClient

    public class CharType
     : IBase{
        [JsonPropertyName("type")]
        public string Type { get; } = "charType"
        ;
        
    }
    
    namespace SeedTraceClient

    public class BinaryTreeType
     : IBase{
        [JsonPropertyName("type")]
        public string Type { get; } = "binaryTreeType"
        ;
        
    }
    
    namespace SeedTraceClient

    public class SinglyLinkedListType
     : IBase{
        [JsonPropertyName("type")]
        public string Type { get; } = "singlyLinkedListType"
        ;
        
    }
    
    namespace SeedTraceClient

    public class DoublyLinkedListType
     : IBase{
        [JsonPropertyName("type")]
        public string Type { get; } = "doublyLinkedListType"
        ;
        
    }
    
    namespace SeedTraceClient

    private interface IBase
    {
    }
    
}
