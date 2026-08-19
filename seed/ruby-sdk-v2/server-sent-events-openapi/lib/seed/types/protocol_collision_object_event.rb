# frozen_string_literal: true

module Seed
  module Types
    class ProtocolCollisionObjectEvent < Internal::Types::Model
      field :data, -> { Seed::Types::ObjectPayloadWithEventField }, optional: false, nullable: false
    end
  end
end
