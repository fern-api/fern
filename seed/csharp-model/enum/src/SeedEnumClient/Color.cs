using System.Text.Json.Serialization;
using System;
using SeedEnumClient.Utilities;

namespace SeedEnumClient;

[JsonConverter(typeof(TolerantEnumConverter))]
public enum Color
{
    [EnumMember(Value = "red")]
    Red,

    [EnumMember(Value = "blue")]
    Blue
}
