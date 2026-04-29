# frozen_string_literal: true

module Seed
  module Events
    module Types
      class SubscribeEventsRequest < Internal::Types::Model
        field :event_type, -> { Seed::Events::Types::EventTypeParam }, optional: true, nullable: false

        field :tags, -> { Seed::Events::Types::StringOrListParam }, optional: true, nullable: false
      end
    end
  end
end
