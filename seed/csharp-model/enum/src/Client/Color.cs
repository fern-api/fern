using System.Text.Json.Serialization;
using System;
using Client.Utilities;

namespace Client;

[JsonConverter(typeof(TolerantEnumConverter))]
public enum Color
{
    [EnumMember(Value = "red")]
    Red,

    [EnumMember(Value = "blue")]
    Blue
}
