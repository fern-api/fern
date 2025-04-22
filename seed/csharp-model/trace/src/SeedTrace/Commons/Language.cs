using System.Text.Json.Serialization;
using SeedTrace.Core;
using System.Runtime.Serialization;

namespace SeedTrace;

[JsonConverter(typeof(EnumSerializer<Language>))]
public enum Language
{
    [EnumMember(Value = "JAVA")]Java,

    [EnumMember(Value = "JAVASCRIPT")]Javascript,

    [EnumMember(Value = "PYTHON")]Python
}
