# frozen_string_literal: true

module FernTrace
  module Commons
    module Types
      class TestCase < Internal::Types::Model
        field :id, -> { String }, optional: false, nullable: false
        field :params, -> { Internal::Types::Array[FernTrace::Commons::Types::VariableValue] }, optional: false, nullable: false
      end
    end
  end
end
