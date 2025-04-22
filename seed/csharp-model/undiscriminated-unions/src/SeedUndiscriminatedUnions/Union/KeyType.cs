using System.Text.Json.Serialization;
using SeedUndiscriminatedUnions.Core;
using System.Runtime.Serialization;

namespace SeedUndiscriminatedUnions;

[JsonConverter(typeof(EnumSerializer<KeyType>))]
public enum KeyType
{
    [EnumMember(Value = "name")]Name,

    [EnumMember(Value = "value")]Value
}
