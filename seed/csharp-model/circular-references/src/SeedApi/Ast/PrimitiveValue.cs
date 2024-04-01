using System.Text.Json.Serialization;
using System;
using SeedApi.Utilities;

namespace SeedApi;

[JsonConverter(typeof(TolerantEnumConverter))]
public enum PrimitiveValue
{
    [EnumMember(Value = "STRING")]
    String,

    [EnumMember(Value = "NUMBER")]
    Number
}
