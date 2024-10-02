using System.Runtime.Serialization;
using System.Text.Json.Serialization;
using SeedTrace.Core;

#nullable enable

namespace SeedTrace;

[JsonConverter(typeof(EnumSerializer<SubmissionTypeEnum>))]
public enum SubmissionTypeEnum
{
    [EnumMember(Value = "TEST")]
    Test,
}
