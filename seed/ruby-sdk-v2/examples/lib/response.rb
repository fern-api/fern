# frozen_string_literal: true

module Types
    module Types
        class Response < Internal::Types::Model
            field :response, Object, optional: true, nullable: true
            field :identifiers, Array, optional: true, nullable: true
        end
    end
end
