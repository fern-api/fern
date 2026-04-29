# frozen_string_literal: true

module Seed
  module Types
    class EntityEventPayload < Internal::Types::Model
      field :entity_id, -> { String }, optional: true, nullable: false, api_name: "entityId"

      field :event_type, -> { Seed::Types::EntityEventPayloadEventType }, optional: true, nullable: false, api_name: "eventType"

      field :updated_time, -> { String }, optional: true, nullable: false, api_name: "updatedTime"
    end
  end
end
