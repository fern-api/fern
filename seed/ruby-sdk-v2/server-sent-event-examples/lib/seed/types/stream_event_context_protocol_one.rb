# frozen_string_literal: true

module Seed
  module Types
    class StreamEventContextProtocolOne < Internal::Types::Model
      field :event, -> { Seed::Types::StreamEventContextProtocolOneEvent }, optional: false, nullable: false
    end
  end
end
