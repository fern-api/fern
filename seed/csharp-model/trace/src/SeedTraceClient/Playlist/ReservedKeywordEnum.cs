using System.Text.Json.Serialization;
using System;
using SeedTraceClient.Utilities;

namespace SeedTraceClient;

[JsonConverter(typeof(TolerantEnumConverter))]
public enum ReservedKeywordEnum
{
    [EnumMember(Value = "is")]
    Is,

    [EnumMember(Value = "as")]
    As
}
