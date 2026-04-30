# frozen_string_literal: true

module Seed
  module Events
    module Types
      # Either a single event type or a list of event types.
      class EventTypeParam < Internal::Types::Model
        extend Seed::Internal::Types::Union

        member -> { Seed::Events::Types::EventTypeEnum }

        member -> { Internal::Types::Array[Seed::Events::Types::EventTypeEnum] }
      end
    end
  end
end
