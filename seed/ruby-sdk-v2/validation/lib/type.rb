# frozen_string_literal: true

module Api
    module Types
        # Defines properties with default values and validation rules.
        class Type < Internal::Types::Model
            field :decimal, Float, optional: true, nullable: true
            field :even, Integer, optional: true, nullable: true
            field :name, String, optional: true, nullable: true
            field :shape, Shape, optional: true, nullable: true
        end
    end
end
