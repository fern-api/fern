using System.Text.Json.Serialization;
using System;
using SeedTrace.Utilities;

namespace SeedTrace;

[JsonConverter(typeof(TolerantEnumConverter))]
public enum ReservedKeywordEnum
{
    [EnumMember(Value = "is")]
    Is,

    [EnumMember(Value = "as")]
    As
}
