using System.Text.Json.Serialization;
using System;
using Client.Utilities;

namespace Client;

[JsonConverter(typeof(TolerantEnumConverter))]
public enum PrimitiveValue
{
    [EnumMember(Value = "STRING")]
    String,

    [EnumMember(Value = "NUMBER")]
    Number
}
