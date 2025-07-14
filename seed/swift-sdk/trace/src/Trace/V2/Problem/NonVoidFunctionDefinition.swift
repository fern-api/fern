public struct NonVoidFunctionDefinition: Codable, Hashable {
    public let signature: NonVoidFunctionSignature
    public let code: FunctionImplementationForMultipleLanguages
}