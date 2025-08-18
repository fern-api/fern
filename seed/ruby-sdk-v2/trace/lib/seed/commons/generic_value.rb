# frozen_string_literal: true

module Seed
    module Types
        class GenericValue < Internal::Types::Model
            field :stringified_type, String, optional: true, nullable: false
            field :stringified_value, String, optional: false, nullable: false

    end
end
