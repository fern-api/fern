using System.Runtime.Serialization;
using System.Text.Json.Serialization;
using SeedExhaustive.Core;

namespace SeedExhaustive.Types.Enum;

[JsonConverter(typeof(EnumSerializer<WeatherReport>))]
public enum WeatherReport
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
