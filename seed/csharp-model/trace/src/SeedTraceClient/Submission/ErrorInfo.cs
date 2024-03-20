using SeedTraceClient
using System.Text.Json.Serialization

namespace SeedTraceClient

public class ErrorInfo
{
    public class _CompileError : CompileError
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "compileError";
    }
    public class _RuntimeError : RuntimeError
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "runtimeError";
    }
    public class _InternalError : InternalError
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "internalError";
    }
}
