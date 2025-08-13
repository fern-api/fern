# frozen_string_literal: true

module Seed
    module Types
        class Identifier < Internal::Types::Model
            field :type, Seed::Type, optional: false, nullable: false
            field :value, String, optional: false, nullable: false
            field :label, String, optional: false, nullable: false

    end
end
