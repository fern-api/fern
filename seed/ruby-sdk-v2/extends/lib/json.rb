# frozen_string_literal: true

module Api
    module Types
        class Json < Internal::Types::Model
            field :raw, String, optional: true, nullable: true
        end
    end
end
