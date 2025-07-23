# frozen_string_literal: true

module Service
    module Types
        class MyObjectWithOptional < Internal::Types::Model
            field :prop, String, optional: true, nullable: true
            field :optional_prop, Array, optional: true, nullable: true
        end
    end
end
