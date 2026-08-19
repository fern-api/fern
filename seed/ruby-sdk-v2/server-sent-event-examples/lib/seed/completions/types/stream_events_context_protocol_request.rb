# frozen_string_literal: true

module Seed
  module Completions
    module Types
      class StreamEventsContextProtocolRequest < Internal::Types::Model
        field :query, -> { String }, optional: false, nullable: false
      end
    end
  end
end
