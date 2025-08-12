
module Seed
    module Types
        class NestedObjectWithRequiredField < Internal::Types::Model
            field :string, , optional: false, nullable: false
            field :nested_object, , optional: false, nullable: false
        end
    end
end
