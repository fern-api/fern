# frozen_string_literal: true

module Service
    module Types
        class WithDocs < Internal::Types::Model
            field :docs, String, optional: true, nullable: true
        end
    end
end
