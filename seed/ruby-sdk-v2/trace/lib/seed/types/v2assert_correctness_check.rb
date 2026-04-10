# frozen_string_literal: true

module Seed
  module Types
    class V2AssertCorrectnessCheck < Internal::Types::Model
      extend Seed::Internal::Types::Union

      member -> { Seed::Types::V2AssertCorrectnessCheckZero }
      member -> { Seed::Types::V2AssertCorrectnessCheckOne }
    end
  end
end
