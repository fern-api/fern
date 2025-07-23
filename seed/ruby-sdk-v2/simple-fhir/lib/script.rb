# frozen_string_literal: true

module Api
    module Types
        class Script < Internal::Types::Model
            field :resource_type, Array, optional: true, nullable: true
            field :name, String, optional: true, nullable: true
        end
    end
end
