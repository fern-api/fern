# frozen_string_literal: true

module Seed
  module Types
    class ProtocolObjectEvent < Internal::Types::Model
      field :data, -> { Seed::Types::StatusPayload }, optional: false, nullable: false
    end
  end
end
