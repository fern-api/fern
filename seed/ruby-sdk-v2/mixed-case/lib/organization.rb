# frozen_string_literal: true

module Service
    module Types
        class Organization < Internal::Types::Model
            field :name, String, optional: true, nullable: true
        end
    end
end
