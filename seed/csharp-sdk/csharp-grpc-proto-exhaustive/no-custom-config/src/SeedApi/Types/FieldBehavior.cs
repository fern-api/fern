using System.Runtime.Serialization;
using System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(EnumSerializer<FieldBehavior>))]
public enum FieldBehavior
{
    [EnumMember(Value = "FIELD_BEHAVIOR_UNSPECIFIED")]
    FieldBehaviorUnspecified,

    [EnumMember(Value = "OPTIONAL")]
    Optional,

    [EnumMember(Value = "REQUIRED")]
    Required,

    [EnumMember(Value = "OUTPUT_ONLY")]
    OutputOnly,

    [EnumMember(Value = "INPUT_ONLY")]
    InputOnly,

    [EnumMember(Value = "IMMUTABLE")]
    Immutable,

    [EnumMember(Value = "UNORDERED_LIST")]
    UnorderedList,

    [EnumMember(Value = "NON_EMPTY_DEFAULT")]
    NonEmptyDefault,

    [EnumMember(Value = "IDENTIFIER")]
    Identifier,
}
