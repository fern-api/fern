using System.Runtime.Serialization;
using System.Text.Json.Serialization;
using SeedExhaustive.Core;
using SeedExhaustive.Types.Enum;

#nullable enable

namespace SeedExhaustive.Types.Enum;

[JsonConverter(typeof(StringEnumSerializer<WeatherReport>))]
public enum WeatherReport
{
    [EnumMember(Value = "SUNNY")]
    Sunny,

    [EnumMember(Value = "CLOUDY")]
    Cloudy,

    [EnumMember(Value = "RAINING")]
    Raining,

    [EnumMember(Value = "SNOWING")]
    Snowing
}
