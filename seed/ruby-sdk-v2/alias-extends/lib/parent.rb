# frozen_string_literal: true

module Api
    module Types
        class Parent < Internal::Types::Model
            field :parent, String, optional: true, nullable: true
        end
    end
end
