using System.Text.Json.Serialization;
using SeedExhaustive.Core;
using System.Runtime.Serialization;

namespace SeedExhaustive.Types;

[JsonConverter(typeof(EnumSerializer<WeatherReport>))]
public enum WeatherReport
{
    [EnumMember(Value = "SUNNY")]Sunny,

    [EnumMember(Value = "CLOUDY")]Cloudy,

    [EnumMember(Value = "RAINING")]Raining,

    [EnumMember(Value = "SNOWING")]Snowing
}
