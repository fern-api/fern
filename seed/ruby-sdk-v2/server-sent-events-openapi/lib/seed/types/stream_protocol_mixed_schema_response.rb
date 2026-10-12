# frozen_string_literal: true

module Seed
  module Types
    class StreamProtocolMixedSchemaResponse < Internal::Types::Model
      extend Seed::Internal::Types::Union

      discriminant :event

      member -> { Seed::Types::DataContextHeartbeat }, key: "HEARTBEAT"

      member -> { Seed::Types::DataContextEntityEvent }, key: "ENTITY"

      member -> { Seed::Types::ProtocolObjectEvent }, key: "OBJECT_DATA"
    end
  end
end
