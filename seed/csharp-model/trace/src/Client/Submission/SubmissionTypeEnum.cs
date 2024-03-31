using System.Text.Json.Serialization;
using System;
using Client.Utilities;

namespace Client;

[JsonConverter(typeof(TolerantEnumConverter))]
public enum SubmissionTypeEnum
{
    [EnumMember(Value = "TEST")]
    Test
}
