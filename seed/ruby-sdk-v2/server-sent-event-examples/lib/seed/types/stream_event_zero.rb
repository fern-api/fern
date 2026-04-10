# frozen_string_literal: true

module Seed
  module Types
    class StreamEventZero < Internal::Types::Model
      field :event, -> { Seed::Types::StreamEventZeroEvent }, optional: false, nullable: false
    end
  end
end
