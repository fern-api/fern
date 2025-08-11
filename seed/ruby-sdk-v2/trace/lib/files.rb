# frozen_string_literal: true

module V2
    module Types
        class Files < Internal::Types::Model
            field :files, Array, optional: true, nullable: true
        end
    end
end
