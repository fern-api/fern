using System.Runtime.Serialization;
using System.Text.Json.Serialization;
using SeedUndiscriminatedUnions.Core;

namespace SeedUndiscriminatedUnions;

[JsonConverter(typeof(EnumSerializer<KeyType>))]
public enum KeyType
{
    [EnumMember(Value = "name")]
    Name,

    [EnumMember(Value = "value")]
    Value,
}
