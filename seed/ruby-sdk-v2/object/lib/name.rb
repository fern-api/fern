# frozen_string_literal: true

module Api
    module Types
        class Name < Internal::Types::Model
            field :id, String, optional: true, nullable: true
            field :value, String, optional: true, nullable: true
        end
    end
end
