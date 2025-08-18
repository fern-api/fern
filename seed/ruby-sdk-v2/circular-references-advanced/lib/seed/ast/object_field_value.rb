# frozen_string_literal: true

module Seed
    module Types
        # This type allows us to test a circular reference with a union type (see FieldValue).
        class ObjectFieldValue < Internal::Types::Model
            field :name, String, optional: false, nullable: false
            field :value, Seed::Ast::FieldValue, optional: false, nullable: false

    end
end
