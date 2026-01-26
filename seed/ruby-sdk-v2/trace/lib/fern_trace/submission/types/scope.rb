# frozen_string_literal: true

module FernTrace
  module Submission
    module Types
      class Scope < Internal::Types::Model
        field :variables, -> { Internal::Types::Hash[String, FernTrace::Commons::Types::DebugVariableValue] }, optional: false, nullable: false
      end
    end
  end
end
