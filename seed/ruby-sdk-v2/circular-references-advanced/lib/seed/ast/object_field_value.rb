
module Seed
    module Types
        # This type allows us to test a circular reference with a union type (see FieldValue).
        class ObjectFieldValue < Internal::Types::Model
            field :name, String, optional: false, nullable: false
            field :value, Seed::ast::FieldValue, optional: false, nullable: false

    end
end
