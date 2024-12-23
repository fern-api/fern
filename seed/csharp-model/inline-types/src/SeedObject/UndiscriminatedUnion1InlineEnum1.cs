using System.Runtime.Serialization;
using System.Text.Json.Serialization;
using SeedObject.Core;

#nullable enable

namespace SeedObject;

[JsonConverter(typeof(EnumSerializer<UndiscriminatedUnion1InlineEnum1>))]
public enum UndiscriminatedUnion1InlineEnum1
{
    [EnumMember(Value = "SUNNY")]
    Sunny,

    [EnumMember(Value = "CLOUDY")]
    Cloudy,

    [EnumMember(Value = "RAINING")]
    Raining,

    [EnumMember(Value = "SNOWING")]
    Snowing,
}
