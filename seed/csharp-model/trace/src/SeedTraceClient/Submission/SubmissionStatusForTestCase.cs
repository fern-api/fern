using SeedTraceClient
using System.Text.Json.Serialization
using OneOf

namespace SeedTraceClient

public class SubmissionStatusForTestCase
{
    namespace SeedTraceClient

    public class TestCaseResultWithStdout
     : TestCaseResultWithStdout, IBase{
        [JsonPropertyName("type")]
        public string Type { get; } = "graded"
        ;
        
    }
    
    namespace SeedTraceClient

    public class Value
     : IBase{
        [JsonPropertyName("type")]
        public string Type { get; } = "gradedV2"
        ;
        
        [JsonPropertyName("value")]
        public OneOf<TestCaseHiddenGrade,TestCaseNonHiddenGrade> Value { get; init; }
    }
    
    namespace SeedTraceClient

    private interface IBase
    {
    }
    
}
