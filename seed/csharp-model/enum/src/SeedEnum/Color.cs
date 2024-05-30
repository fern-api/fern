using System.Runtime.Serialization;
using System.Text.Json.Serialization;
using SeedEnum;
using SeedEnum.Core;

#nullable enable

namespace SeedEnum;

[JsonConverter(typeof(StringEnumSerializer<Color>))]
public enum Color
{
    [EnumMember(Value = "red")]
    Red,

    [EnumMember(Value = "blue")]
    Blue
}
