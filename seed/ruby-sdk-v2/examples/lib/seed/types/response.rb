# frozen_string_literal: true

module Seed
    module Types
        class Response < Internal::Types::Model
            field :response, Internal::Types::Hash[String, ], optional: false, nullable: false
            field :identifiers, Internal::Types::Array[Seed::Identifier], optional: false, nullable: false

    end
end
