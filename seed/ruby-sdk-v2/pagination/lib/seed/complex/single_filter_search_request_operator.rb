
module Seed
    module Types
        module SingleFilterSearchRequestOperator
            extends Seed::Internal::Types::Enum
            EQUALS = "="
            NOT_EQUALS = "!="
            IN = "IN"
            NOT_IN = "NIN"
            LESS_THAN = "<"
            GREATER_THAN = ">"
            CONTAINS = "~"
            DOES_NOT_CONTAIN = "!~"
            STARTS_WITH = "^"
            ENDS_WITH = "$"end
    end
end
