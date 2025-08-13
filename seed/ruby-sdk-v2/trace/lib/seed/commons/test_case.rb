# frozen_string_literal: true

module Seed
    module Types
        class TestCase < Internal::Types::Model
            field :id, String, optional: false, nullable: false
            field :params, Internal::Types::Array[Seed::Commons::VariableValue], optional: false, nullable: false

    end
end
