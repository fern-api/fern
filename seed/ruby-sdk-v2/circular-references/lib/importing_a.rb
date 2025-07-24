# frozen_string_literal: true

module Api
    module Types
        class ImportingA < Internal::Types::Model
            field :a, Array, optional: true, nullable: true
        end
    end
end
