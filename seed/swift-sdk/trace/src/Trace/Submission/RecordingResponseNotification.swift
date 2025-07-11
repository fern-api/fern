public struct RecordingResponseNotification {
    public let submissionId: SubmissionId
    public let testCaseId: String?
    public let lineNumber: Int
    public let lightweightStackInfo: LightweightStackframeInformation
    public let tracedFile: TracedFile?
}