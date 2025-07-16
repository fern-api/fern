export const PATH_FIELD_NUMBERS = {
    // FileDescriptorProto fields (top level)
    FILE: {
        NAME: 1, // file name
        PACKAGE: 2, // package
        DEPENDENCY: 3, // imports
        MESSAGE_TYPE: 4, // messages
        ENUM_TYPE: 5, // enums
        SERVICE: 6, // services
        EXTENSION: 7, // extensions
        OPTIONS: 8, // file options
        SOURCE_CODE_INFO: 9, // source code info
        PUBLIC_DEPENDENCY: 10, // public imports
        WEAK_DEPENDENCY: 11, // weak imports
        SYNTAX: 12 // syntax declaration
    },

    // DescriptorProto fields (for messages)
    MESSAGE: {
        NAME: 1, // message name
        FIELD: 2, // fields
        NESTED_TYPE: 3, // nested messages
        ENUM_TYPE: 4, // nested enums
        EXTENSION_RANGE: 5, // extension ranges
        EXTENSION: 6, // extensions
        OPTIONS: 7, // message options
        ONEOF_DECL: 8, // oneof declarations
        RESERVED_RANGE: 9, // reserved ranges
        RESERVED_NAME: 10 // reserved names
    },

    // EnumDescriptorProto fields
    ENUM: {
        NAME: 1, // enum name
        VALUE: 2, // enum values
        OPTIONS: 3, // enum options
        RESERVED_RANGE: 4, // reserved ranges
        RESERVED_NAME: 5 // reserved names
    },

    // ServiceDescriptorProto fields
    SERVICE: {
        NAME: 1, // service name
        METHOD: 2, // methods
        OPTIONS: 3 // service options
    },

    // MethodDescriptorProto fields
    METHOD: {
        NAME: 1, // method name
        INPUT_TYPE: 2, // input type
        OUTPUT_TYPE: 3, // output type
        OPTIONS: 4, // method options
        CLIENT_STREAMING: 5, // client streaming flag
        SERVER_STREAMING: 6 // server streaming flag
    }
} as const

export const SOURCE_CODE_INFO_PATH_STARTERS = {
    MESSAGE: 4,
    ENUM: 5,
    SERVICE: 6
} as const
