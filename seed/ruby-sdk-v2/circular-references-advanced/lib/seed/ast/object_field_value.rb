
module Seed
    module Types
        # This type allows us to test a circular reference with a union type (see FieldValue).
        class ObjectFieldValue < Internal::Types::Model
            field :name, , optional: false, nullable: false
            field :value, , optional: false, nullable: false
        end
    end
end
