using System.Runtime.Serialization;

#nullable enable

namespace SeedExamples;

public enum BasicType
{
    [EnumMember(Value = "primitive")]
    Primitive,

    [EnumMember(Value = "literal")]
    Literal
}
