using System.Text.Json.Serialization;
using System;
using SeedExhaustiveClient.Utilities;

namespace SeedExhaustiveClient.Types;

[JsonConverter(typeof(TolerantEnumConverter))]
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
