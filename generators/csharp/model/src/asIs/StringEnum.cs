// public class RealtimeTranscriptType
// {
//     public readonly Value value;
//     public readonly String _raw;
    
//     [JsonConverter(typeof(TolerantEnumConverter))]
//     public enum RealtimeTranscriptType
//     {
//         PartialTranscript,
//         FinalTranscript,
//         Unknown
//     }
// }

// [JsonConverter(typeof(TolerantEnumConverter))]
// public enum RealtimeTranscriptType
// {
//     [EnumMember(Value = "partial_transcript")]
//     PartialTranscript,
//     [EnumMember(Value = "final//transcript")]
//     FinalTranscript,
//     Unknown
// }

[JsonConverter(typeof(StringEnumConverter))]
public class StringEnum<T> where T : System.Enum
{
    public readonly T value;
    public readonly String _raw;
}
