# frozen_string_literal: true

module Ast
    module Types
        # This type allows us to test a circular reference with a union type (see FieldValue).
        class ObjectFieldValue < Internal::Types::Model
            field :name, FieldName, optional: true, nullable: true
            field :value, FieldValue, optional: true, nullable: true
        end
    end
end
