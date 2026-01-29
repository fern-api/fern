# frozen_string_literal: true

module Seed
  module Dummy
    module Types
      class GenerateRequest < Internal::Types::Model
        field :stream, -> { Internal::Types::Boolean }, optional: false, nullable: false
        field :num_events, -> { Integer }, optional: false, nullable: false
      end
    end
  end
end
