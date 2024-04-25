using System.Runtime.Serialization;

namespace SeedApi;

public enum PrimitiveValue
{
    [EnumMember(Value = "STRING")]
    String,

    [EnumMember(Value = "NUMBER")]
    Number
}
