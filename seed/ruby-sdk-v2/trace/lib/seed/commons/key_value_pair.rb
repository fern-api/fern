
module Seed
    module Types
        class KeyValuePair < Internal::Types::Model
            field :key, , optional: false, nullable: false
            field :value, , optional: false, nullable: false
        end
    end
end
