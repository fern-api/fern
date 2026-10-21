# frozen_string_literal: true

require_relative "../.."

module Seed
  module Submission
    module Types
      class Scope < Internal::Types::Model
        field :variables, -> { Internal::Types::Hash[String, Seed::Commons::Types::DebugVariableValue] }, optional: false, nullable: false
      end
    end
  end
end
