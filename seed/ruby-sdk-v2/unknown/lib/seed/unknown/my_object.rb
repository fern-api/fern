# frozen_string_literal: true

module Seed
    module Types
        class MyObject < Internal::Types::Model
            field :unknown, Internal::Types::Hash[String, ], optional: false, nullable: false
        end
    end
end
