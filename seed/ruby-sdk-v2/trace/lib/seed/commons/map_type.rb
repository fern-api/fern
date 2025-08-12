
module Seed
    module Types
        class MapType < Internal::Types::Model
            field :key_type, , optional: false, nullable: false
            field :value_type, , optional: false, nullable: false
        end
    end
end
