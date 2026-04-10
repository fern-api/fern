import Foundation

extension Requests {
    public struct MultipartFormMultipartFormRequest {
        public let color: Color?
        public let maybeColor: Color?
        public let colorList: [Color]?
        public let maybeColorList: Nullable<[Color]>?

        public init(
            color: Color? = nil,
            maybeColor: Color? = nil,
            colorList: [Color]? = nil,
            maybeColorList: Nullable<[Color]>? = nil
        ) {
            self.color = color
            self.maybeColor = maybeColor
            self.colorList = colorList
            self.maybeColorList = maybeColorList
        }
    }
}

extension Requests.MultipartFormMultipartFormRequest: MultipartFormDataConvertible {
    var multipartFormFields: [MultipartFormField] {
        [
            .field(color, fieldName: "color"),
            .field(maybeColor, fieldName: "maybeColor"),
            .field(colorList, fieldName: "colorList"),
            .field(maybeColorList, fieldName: "maybeColorList")
        ]
    }
}