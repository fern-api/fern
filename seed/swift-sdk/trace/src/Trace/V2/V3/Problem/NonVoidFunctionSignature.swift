public struct NonVoidFunctionSignature: Codable, Hashable {
    public let parameters: [Parameter]
    public let returnType: VariableType
}