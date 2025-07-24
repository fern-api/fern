# frozen_string_literal: true

module Api
    module Types
        class Docs < Internal::Types::Model
            field :docs, String, optional: true, nullable: true
        end
    end
end
