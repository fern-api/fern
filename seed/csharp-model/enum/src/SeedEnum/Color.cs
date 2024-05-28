using System.Runtime.Serialization;

#nullable enable

namespace SeedEnum;

public enum Color
{
    [EnumMember(Value = "red")]
    Red,

    [EnumMember(Value = "blue")]
    Blue
}
