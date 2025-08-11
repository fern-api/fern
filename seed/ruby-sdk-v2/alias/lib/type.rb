# frozen_string_literal: true

module Api
    module Types
        # A simple type with just a name.
        class Type < Internal::Types::Model
            field :id, TypeId, optional: true, nullable: true
            field :name, String, optional: true, nullable: true
        end
    end
end
