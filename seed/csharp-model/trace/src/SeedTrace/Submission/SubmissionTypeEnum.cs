using System.Text.Json.Serialization;
using SeedTrace.Core;
using System.Runtime.Serialization;

namespace SeedTrace;

[JsonConverter(typeof(EnumSerializer<SubmissionTypeEnum>))]
public enum SubmissionTypeEnum
{
    [EnumMember(Value = "TEST")]Test
}
