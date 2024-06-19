using System.Runtime.Serialization;
using System.Text.Json.Serialization;
using SeedTrace;
using SeedTrace.Core;

#nullable enable

namespace SeedTrace;

[JsonConverter(typeof(StringEnumSerializer<SubmissionTypeEnum>))]
public enum SubmissionTypeEnum
{
    [EnumMember(Value = "TEST")]
    Test
}
