using SeedTraceClient.V2
using System.Text.Json.Serialization

namespace SeedTraceClient.V2

public class FunctionSignature
{
    namespace SeedTraceClient.V2

    public class NonVoidFunctionSignature
     : NonVoidFunctionSignature, IBase{
        [JsonPropertyName("type")]
        public string Type { get; } = "nonVoid"
        ;
        
    }
    
    namespace SeedTraceClient.V2

    private interface IBase
    {
    }
    
}
