
module Seed
    module Types
        module ErrorCode
            extends Seed::Internal::Types::Enum
            INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR"
            UNAUTHORIZED = "UNAUTHORIZED"
            FORBIDDEN = "FORBIDDEN"
            BAD_REQUEST = "BAD_REQUEST"
            CONFLICT = "CONFLICT"
            GONE = "GONE"
            UNPROCESSABLE_ENTITY = "UNPROCESSABLE_ENTITY"
            NOT_IMPLEMENTED = "NOT_IMPLEMENTED"
            BAD_GATEWAY = "BAD_GATEWAY"
            SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE"
            UNKNOWN = "Unknown"end
    end
end
