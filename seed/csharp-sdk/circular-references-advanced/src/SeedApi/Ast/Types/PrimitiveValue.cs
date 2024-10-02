using System.Runtime.Serialization;
using System.Text.Json.Serialization;
using SeedApi.Core;

#nullable enable

namespace SeedApi;

[JsonConverter(typeof(EnumSerializer<PrimitiveValue>))]
public enum PrimitiveValue
{
    [EnumMember(Value = "STRING")]
    String,

    [EnumMember(Value = "NUMBER")]
    Number,
}
