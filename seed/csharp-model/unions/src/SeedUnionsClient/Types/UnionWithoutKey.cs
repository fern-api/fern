using SeedUnionsClient
using System.Text.Json.Serialization

namespace SeedUnionsClient

public class UnionWithoutKey
{
    namespace SeedUnionsClient

    public class Foo
     : Foo, IBase{
        [JsonPropertyName("type")]
        public string Type { get; } = "foo"
        ;
        
    }
    
    namespace SeedUnionsClient

    public class Bar
     : Bar, IBase{
        [JsonPropertyName("type")]
        public string Type { get; } = "bar"
        ;
        
    }
    
    namespace SeedUnionsClient

    private interface IBase
    {
    }
    
}
