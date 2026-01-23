# frozen_string_literal: true

module FernServerSentEvents
  module Completions
    module Types
      class StreamCompletionRequest < Internal::Types::Model
        field :query, -> { String }, optional: false, nullable: false
      end
    end
  end
end
