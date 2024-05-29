using System.Runtime.Serialization;

#nullable enable

namespace SeedApi;

public enum PrimitiveValue
{
    [EnumMember(Value = "STRING")]
    String,

    [EnumMember(Value = "NUMBER")]
    Number
}
