# frozen_string_literal: true

module Seed
    module Types
        class Scope < Internal::Types::Model
            field :variables, Internal::Types::Hash[String, Seed::Commons::DebugVariableValue], optional: false, nullable: false

    end
end
