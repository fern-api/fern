import Foundation

extension Requests {
    public struct MyRequest {
        public let maybeString: String?
        public let integer: Int
        public let file: FormFile
        public let fileList: [FormFile]
        public let maybeFile: FormFile
        public let maybeFileList: [FormFile]
        public let maybeInteger: Int?
        public let optionalListOfStrings: [String]?
        public let listOfObjects: [MyObject]
        public let optionalMetadata: JSONValue?
        public let optionalObjectType: ObjectType?
        public let optionalId: Id?
        public let aliasObject: MyAliasObject
        public let listOfAliasObject: [MyAliasObject]
        public let aliasListOfObject: MyCollectionAliasObject

        public init(
            maybeString: String? = nil,
            integer: Int,
            file: FormFile,
            fileList: [FormFile],
            maybeFile: FormFile,
            maybeFileList: [FormFile],
            maybeInteger: Int? = nil,
            optionalListOfStrings: [String]? = nil,
            listOfObjects: [MyObject],
            optionalMetadata: JSONValue? = nil,
            optionalObjectType: ObjectType? = nil,
            optionalId: Id? = nil,
            aliasObject: MyAliasObject,
            listOfAliasObject: [MyAliasObject],
            aliasListOfObject: MyCollectionAliasObject
        ) {
            self.maybeString = maybeString
            self.integer = integer
            self.file = file
            self.fileList = fileList
            self.maybeFile = maybeFile
            self.maybeFileList = maybeFileList
            self.maybeInteger = maybeInteger
            self.optionalListOfStrings = optionalListOfStrings
            self.listOfObjects = listOfObjects
            self.optionalMetadata = optionalMetadata
            self.optionalObjectType = optionalObjectType
            self.optionalId = optionalId
            self.aliasObject = aliasObject
            self.listOfAliasObject = listOfAliasObject
            self.aliasListOfObject = aliasListOfObject
        }
    }
}

extension Requests.MyRequest: MultipartFormDataConvertible {
    var multipartFormFields: [MultipartFormField] {
        [
            .field(maybeString, fieldName: "maybe_string"),
            .field(integer, fieldName: "integer"),
            .file(file, fieldName: "file"),
            .fileArray(fileList, fieldName: "file_list"),
            .file(maybeFile, fieldName: "maybe_file"),
            .fileArray(maybeFileList, fieldName: "maybe_file_list"),
            .field(maybeInteger, fieldName: "maybe_integer"),
            .field(optionalListOfStrings, fieldName: "optional_list_of_strings"),
            .field(listOfObjects, fieldName: "list_of_objects"),
            .field(optionalMetadata, fieldName: "optional_metadata"),
            .field(optionalObjectType, fieldName: "optional_object_type"),
            .field(optionalId, fieldName: "optional_id"),
            .field(aliasObject, fieldName: "alias_object"),
            .field(listOfAliasObject, fieldName: "list_of_alias_object"),
            .field(aliasListOfObject, fieldName: "alias_list_of_object")
        ]
    }
}