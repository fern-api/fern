# frozen_string_literal: true

module Api
    module Types
        class WithMetadata < Internal::Types::Model
            field :metadata, Array, optional: true, nullable: true
        end
    end
end
