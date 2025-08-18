# frozen_string_literal: true

module Seed
    module Types
        class NestedType < Internal::Types::Model
            field :name, String, optional: false, nullable: false
        end
    end
end
