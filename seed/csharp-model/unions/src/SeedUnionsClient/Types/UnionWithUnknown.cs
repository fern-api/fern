using SeedUnionsClient
using System.Text.Json.Serialization

namespace SeedUnionsClient

public class UnionWithUnknown
{
    namespace SeedUnionsClient

    public class Foo
     : Foo, IBase{
        [JsonPropertyName("type")]
        public string Type { get; } = "foo"
        ;
        
    }
    
    namespace SeedUnionsClient

    public class Unknown
     : IBase{
        [JsonPropertyName("type")]
        public string Type { get; } = "unknown"
        ;
        
    }
    
    namespace SeedUnionsClient

    private interface IBase
    {
    }
    
}
