# frozen_string_literal: true

module Api
    module Types
        class NestedType < Internal::Types::Model
            field :name, String, optional: true, nullable: true
        end
    end
end
