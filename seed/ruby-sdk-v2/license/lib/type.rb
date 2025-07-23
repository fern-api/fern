# frozen_string_literal: true

module Api
    module Types
        # A simple type with just a name.
        class Type < Internal::Types::Model
            field :name, String, optional: true, nullable: true
        end
    end
end
