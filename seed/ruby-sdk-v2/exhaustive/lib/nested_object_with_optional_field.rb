# frozen_string_literal: true

module Types
    module Types
        class NestedObjectWithOptionalField < Internal::Types::Model
            field :string, Array, optional: true, nullable: true
            field :nested_object, Array, optional: true, nullable: true
        end
    end
end
