# frozen_string_literal: true

module Union
    module Types
        class NamedMetadata < Internal::Types::Model
            field :name, String, optional: true, nullable: true
            field :value, Array, optional: true, nullable: true
        end
    end
end
