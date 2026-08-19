# frozen_string_literal: true

module Seed
  module Types
    class HeartbeatPayload < Internal::Types::Model
      field :timestamp, -> { String }, optional: true, nullable: false
    end
  end
end
