# frozen_string_literal: true

module Seed
  module Types
    # A single chunk in a streamed completion response.
    class CompletionStreamChunk < Internal::Types::Model
      field :delta, -> { String }, optional: true, nullable: false
      field :tokens, -> { Integer }, optional: true, nullable: false
    end
  end
end
