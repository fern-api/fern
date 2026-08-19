# frozen_string_literal: true

module Seed
  module Completions
    module Types
      class StreamEventsRequest < Internal::Types::Model
        field :query, -> { String }, optional: false, nullable: false
      end
    end
  end
end
