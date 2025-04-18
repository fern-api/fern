using System.Runtime.Serialization;
using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(EnumSerializer<Language>))]
public enum Language
{
    [EnumMember(Value = "JAVA")]
    Java,

    [EnumMember(Value = "JAVASCRIPT")]
    Javascript,

    [EnumMember(Value = "PYTHON")]
    Python,
}
