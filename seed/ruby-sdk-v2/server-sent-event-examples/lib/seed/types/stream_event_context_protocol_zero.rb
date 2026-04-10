# frozen_string_literal: true

module Seed
  module Types
    class StreamEventContextProtocolZero < Internal::Types::Model
      field :event, -> { Seed::Types::StreamEventContextProtocolZeroEvent }, optional: false, nullable: false
    end
  end
end
