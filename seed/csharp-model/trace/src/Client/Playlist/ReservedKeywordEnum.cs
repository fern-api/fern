using System.Text.Json.Serialization;
using System;
using Client.Utilities;

namespace Client;

[JsonConverter(typeof(TolerantEnumConverter))]
public enum ReservedKeywordEnum
{
    [EnumMember(Value = "is")]
    Is,

    [EnumMember(Value = "as")]
    As
}
