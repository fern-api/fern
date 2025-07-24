# frozen_string_literal: true

module Service
    module Types
        class Response < Internal::Types::Model
            field :data, Movie, optional: true, nullable: true
        end
    end
end
