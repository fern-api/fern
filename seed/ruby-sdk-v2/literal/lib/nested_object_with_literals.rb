# frozen_string_literal: true

module Reference
    module Types
        class NestedObjectWithLiterals < Internal::Types::Model
            field :literal_1, Array, optional: true, nullable: true
            field :literal_2, Array, optional: true, nullable: true
            field :str_prop, String, optional: true, nullable: true
        end
    end
end
