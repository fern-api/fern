# frozen_string_literal: true

module Seed
  module Types
    class V2AssertCorrectnessCheckZero < Internal::Types::Model
      field :type, -> { Seed::Types::V2AssertCorrectnessCheckZeroType }, optional: false, nullable: false
    end
  end
end
