using System.Runtime.Serialization;

namespace SeedExamples;

public enum BasicType
{
    [EnumMember(Value = "primitive")]
    Primitive,

    [EnumMember(Value = "literal")]
    Literal
}
