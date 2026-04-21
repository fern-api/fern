# frozen_string_literal: true

module Seed
  module Types
    class StreamProtocolCollisionResponse < Internal::Types::Model
      extend Seed::Internal::Types::Union

      discriminant :event

      member -> { Seed::Types::ProtocolHeartbeat }, key: "HEARTBEAT"

      member -> { Seed::Types::ProtocolStringEvent }, key: "STRING_DATA"

      member -> { Seed::Types::ProtocolNumberEvent }, key: "NUMBER_DATA"

      member -> { Seed::Types::ProtocolCollisionObjectEvent }, key: "OBJECT_DATA"
    end
  end
end
