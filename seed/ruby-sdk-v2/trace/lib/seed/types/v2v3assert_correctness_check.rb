# frozen_string_literal: true

module Seed
  module Types
    class V2V3AssertCorrectnessCheck < Internal::Types::Model
      extend Seed::Internal::Types::Union

      member -> { Seed::Types::V2V3AssertCorrectnessCheckZero }
      member -> { Seed::Types::V2V3AssertCorrectnessCheckOne }
    end
  end
end
