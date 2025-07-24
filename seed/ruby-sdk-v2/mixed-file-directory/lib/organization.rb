# frozen_string_literal: true

module Organization
    module Types
        class Organization < Internal::Types::Model
            field :id, Id, optional: true, nullable: true
            field :name, String, optional: true, nullable: true
            field :users, Array, optional: true, nullable: true
        end
    end
end
