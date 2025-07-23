# frozen_string_literal: true

module Api
    module Types
        class Patient < Internal::Types::Model
            field :resource_type, Array, optional: true, nullable: true
            field :name, String, optional: true, nullable: true
            field :scripts, Array, optional: true, nullable: true
        end
    end
end
