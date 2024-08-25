using System.Text.Json.Serialization;
using SeedExamples.Core;

#nullable enable

namespace SeedExamples;

public record ExceptionInfo
{
    [JsonPropertyName("exceptionType")]
    public required string ExceptionType { get; set; }

    [JsonPropertyName("exceptionMessage")]
    public required string ExceptionMessage { get; set; }

    [JsonPropertyName("exceptionStacktrace")]
    public required string ExceptionStacktrace { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
