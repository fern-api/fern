using System.Runtime.Serialization;
using System.Text.Json.Serialization;
using SeedEnum.Core;

#nullable enable

namespace SeedEnum;

[JsonConverter(typeof(EnumSerializer<Color>))]
public enum Color
{
    [EnumMember(Value = "red")]
    Red,

    [EnumMember(Value = "blue")]
    Blue,
}
