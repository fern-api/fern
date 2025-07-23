# frozen_string_literal: true

module Api
    module Types
        class Child < Internal::Types::Model
            field :child, String, optional: true, nullable: true
        end
    end
end
