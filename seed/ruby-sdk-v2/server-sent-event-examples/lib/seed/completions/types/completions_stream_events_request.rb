# frozen_string_literal: true

module Seed
  module Completions
    module Types
      class CompletionsStreamEventsRequest < Internal::Types::Model
        field :query, -> { String }, optional: false, nullable: false
      end
    end
  end
end
