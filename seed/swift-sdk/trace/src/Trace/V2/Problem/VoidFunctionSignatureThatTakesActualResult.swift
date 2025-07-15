public struct VoidFunctionSignatureThatTakesActualResult: Codable, Hashable {
    public let parameters: [Parameter]
    public let actualResultType: VariableType
}