# frozen_string_literal: true

module Api
    module Types
        class RootType < Internal::Types::Model
            field :s, String, optional: true, nullable: true
        end
    end
end
