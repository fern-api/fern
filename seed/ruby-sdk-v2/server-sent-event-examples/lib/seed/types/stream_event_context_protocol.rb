# frozen_string_literal: true

module Seed
  module Types
    class StreamEventContextProtocol < Internal::Types::Model
      extend Seed::Internal::Types::Union

      member -> { Seed::Types::StreamEventContextProtocolZero }
      member -> { Seed::Types::StreamEventContextProtocolOne }
      member -> { Seed::Types::StreamEventContextProtocolTwo }
    end
  end
end
