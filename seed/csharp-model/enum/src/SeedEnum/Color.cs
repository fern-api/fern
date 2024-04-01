using System.Text.Json.Serialization;
using System;
using SeedEnum.Utilities;

namespace SeedEnum;

[JsonConverter(typeof(TolerantEnumConverter))]
public enum Color
{
    [EnumMember(Value = "red")]
    Red,

    [EnumMember(Value = "blue")]
    Blue
}
