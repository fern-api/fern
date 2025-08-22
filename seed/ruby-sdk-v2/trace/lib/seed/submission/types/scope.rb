# frozen_string_literal: true

module Seed
  module Submission
    module Types
      class Scope < Internal::Types::Model
        field :variables, lambda {
          Internal::Types::Hash[String, Seed::Commons::Types::DebugVariableValue]
        }, optional: false, nullable: false
      end
    end
  end
end
