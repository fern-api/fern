public struct InvalidRequestResponse: Codable, Hashable {
    public let request: SubmissionRequest
    public let cause: InvalidRequestCause
}