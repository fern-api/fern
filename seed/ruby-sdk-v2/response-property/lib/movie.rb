# frozen_string_literal: true

module Service
    module Types
        class Movie < Internal::Types::Model
            field :id, String, optional: true, nullable: true
            field :name, String, optional: true, nullable: true
        end
    end
end
