# frozen_string_literal: true

module Api
    module Types
        class Failure < Internal::Types::Model
            field :status, Array, optional: true, nullable: true
        end
    end
end
