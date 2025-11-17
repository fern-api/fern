import Foundation

extension Requests {
    public struct MultipartFormRequest {
        public let color: Color
        public let maybeColor: Color?
        public let colorList: [Color]
        public let maybeColorList: [Color]?

        public init(
            color: Color,
            maybeColor: Color? = nil,
            colorList: [Color],
            maybeColorList: [Color]? = nil
        ) {
            self.color = color
            self.maybeColor = maybeColor
            self.colorList = colorList
            self.maybeColorList = maybeColorList
        }
    }
}

extension Requests.MultipartFormRequest: MultipartFormDataConvertible {
    var multipartFormFields: [MultipartFormField] {
        [
            .field(color, fieldName: "color"),
            .field(maybeColor, fieldName: "maybeColor"),
            .field(colorList, fieldName: "colorList"),
            .field(maybeColorList, fieldName: "maybeColorList")
        ]
    }
}