
module Seed
    module Types
        class ListType < Internal::Types::Model
            field :value_type, , optional: false, nullable: false
            field :is_fixed_length, , optional: true, nullable: false
        end
    end
end
