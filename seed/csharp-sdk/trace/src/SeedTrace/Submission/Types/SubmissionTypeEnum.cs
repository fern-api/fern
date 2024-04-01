using System.Text.Json.Serialization;
using System;
using SeedTrace.Utilities;

namespace SeedTrace;

[JsonConverter(typeof(TolerantEnumConverter))]
public enum SubmissionTypeEnum
{
    [EnumMember(Value = "TEST")]
    Test
}
