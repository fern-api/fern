using SeedUnionsClient
using System.Text.Json.Serialization

namespace SeedUnionsClient

public class Union
{
    namespace SeedUnionsClient

    public class Foo
     : IBase{
        [JsonPropertyName("type")]
        public string Type { get; } = "foo"
        ;
        
        [JsonPropertyName("foo")]
        public Foo Foo { get; init; }
    }
    
    namespace SeedUnionsClient

    public class Bar
     : IBase{
        [JsonPropertyName("type")]
        public string Type { get; } = "bar"
        ;
        
        [JsonPropertyName("bar")]
        public Bar Bar { get; init; }
    }
    
    namespace SeedUnionsClient

    private interface IBase
    {
    }
    
}
