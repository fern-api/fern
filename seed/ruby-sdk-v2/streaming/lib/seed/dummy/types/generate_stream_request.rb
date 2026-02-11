# frozen_string_literal: true

module Seed
  module Dummy
    module Types
      class GenerateStreamRequest < Internal::Types::Model
        field :stream, -> { Internal::Types::Boolean }, optional: false, nullable: false
        field :num_events, -> { Integer }, optional: false, nullable: false
      end
    end
  end
end
