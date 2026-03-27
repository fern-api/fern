# frozen_string_literal: true

module Seed
  module Types
    module EntityEventPayloadEventType
      extend Seed::Internal::Types::Enum

      CREATED = "CREATED"
      UPDATED = "UPDATED"
      DELETED = "DELETED"
      PREEXISTING = "PREEXISTING"
    end
  end
end
