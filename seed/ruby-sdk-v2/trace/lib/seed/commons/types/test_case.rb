# frozen_string_literal: true

require_relative "../../../seed"

module Seed
  module Commons
    module Types
      class TestCase < Internal::Types::Model
        field :id, -> { String }, optional: false, nullable: false

        field :params, -> { Internal::Types::Array[Seed::Commons::Types::VariableValue] }, optional: false, nullable: false
      end
    end
  end
end
