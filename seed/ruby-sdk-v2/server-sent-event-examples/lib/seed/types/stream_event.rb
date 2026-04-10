# frozen_string_literal: true

module Seed
  module Types
    class StreamEvent < Internal::Types::Model
      extend Seed::Internal::Types::Union

      member -> { Seed::Types::StreamEventZero }
      member -> { Seed::Types::StreamEventOne }
    end
  end
end
