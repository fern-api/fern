# frozen_string_literal: true

module Seed
    module Types
        class Request < Internal::Types::Model
            field :request, Internal::Types::Hash[String, ], optional: false, nullable: false

    end
end
