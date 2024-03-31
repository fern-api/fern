using System.Text.Json.Serialization;
using System;
using Client.Utilities;

namespace Client;

[JsonConverter(typeof(TolerantEnumConverter))]
public enum FileInfo
{
    [EnumMember(Value = "REGULAR")]
    Regular,

    [EnumMember(Value = "DIRECTORY")]
    Directory
}
