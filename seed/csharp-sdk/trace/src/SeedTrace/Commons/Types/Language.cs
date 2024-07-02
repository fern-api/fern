using System.Runtime.Serialization;
using System.Text.Json.Serialization;
using SeedTrace;
using SeedTrace.Core;

#nullable enable

namespace SeedTrace;

[JsonConverter(typeof(StringEnumSerializer<Language>))]
public enum Language
{
    [EnumMember(Value = "JAVA")]
    Java,

    [EnumMember(Value = "JAVASCRIPT")]
    Javascript,

    [EnumMember(Value = "PYTHON")]
    Python
}
