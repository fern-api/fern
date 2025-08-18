# frozen_string_literal: true

module Seed
    module Types
        class Metadata < Internal::Types::Model
            field :id, String, optional: false, nullable: false
            field :value, Internal::Types::Hash[String, ], optional: false, nullable: false

    end
end
