using System.Text.Json.Serialization;
using System;
using Client.Utilities;

namespace Client;

[JsonConverter(typeof(TolerantEnumConverter))]
public enum Language
{
    [EnumMember(Value = "JAVA")]
    Java,

    [EnumMember(Value = "JAVASCRIPT")]
    Javascript,

    [EnumMember(Value = "PYTHON")]
    Python
}
