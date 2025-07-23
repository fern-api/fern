# frozen_string_literal: true

module Commons
    module Types
        class GenericValue < Internal::Types::Model
            field :stringified_type, Array, optional: true, nullable: true
            field :stringified_value, String, optional: true, nullable: true
        end
    end
end
