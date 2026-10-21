# frozen_string_literal: true

require_relative ".."

module Seed
  module Types
    class ProtocolCollisionObjectEvent < Internal::Types::Model
      field :data, -> { Seed::Types::ObjectPayloadWithEventField }, optional: false, nullable: false
    end
  end
end
