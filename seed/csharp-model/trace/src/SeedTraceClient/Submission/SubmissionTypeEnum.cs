using System.Text.Json.Serialization
using System
using SeedTraceClient.Utilities

namespace SeedTraceClient

[JsonConverter(typeof(TolerantEnumConverter))]
public enum SubmissionTypeEnum
{
    [EnumMember(Value = "TEST")]
    Test
}
