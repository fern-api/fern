using System.Runtime.Serialization;

namespace SeedEnum;

public enum Color
{
    [EnumMember(Value = "red")]
    Red,

    [EnumMember(Value = "blue")]
    Blue
}
