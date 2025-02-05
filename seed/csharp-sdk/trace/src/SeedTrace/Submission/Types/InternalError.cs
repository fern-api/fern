using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

public record InternalError
{
    [JsonPropertyName("exceptionInfo")]
    public required ExceptionInfo ExceptionInfo { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
