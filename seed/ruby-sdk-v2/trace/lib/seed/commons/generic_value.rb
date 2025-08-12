
module Seed
    module Types
        class GenericValue < Internal::Types::Model
            field :stringified_type, , optional: true, nullable: false
            field :stringified_value, , optional: false, nullable: false
        end
    end
end
