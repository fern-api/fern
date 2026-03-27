# frozen_string_literal: true

module Seed
  module Types
    class StreamProtocolWithFlatSchemaResponse < Internal::Types::Model
      extend Seed::Internal::Types::Union

      discriminant :event

      member -> { Seed::Types::DataContextHeartbeat }, key: "HEARTBEAT"
      member -> { Seed::Types::DataContextEntityEvent }, key: "ENTITY"
    end
  end
end
