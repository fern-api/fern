# frozen_string_literal: true

module Organizations
    module Types
        class Organization < Internal::Types::Model
            field :name, String, optional: true, nullable: true
            field :tags, Array, optional: true, nullable: true
        end
    end
end
