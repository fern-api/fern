
module Seed
    module Types
        class FilteredType < Internal::Types::Model
            field :public_property, , optional: true, nullable: false
            field :private_property, , optional: false, nullable: false
        end
    end
end
