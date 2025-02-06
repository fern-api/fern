using System.Runtime.Serialization;
using System.Text.Json.Serialization;
using SeedExamples.Core;

namespace SeedExamples;

[JsonConverter(typeof(EnumSerializer<ComplexType>))]
public enum ComplexType
{
    [EnumMember(Value = "object")]
    Object,

    [EnumMember(Value = "union")]
    Union,

    [EnumMember(Value = "unknown")]
    Unknown,
}
