# frozen_string_literal: true

module Seed
  module Completions
    module Types
      class StreamEvent < Internal::Types::Model
        extend Seed::Internal::Types::Union

        discriminant :event

        member -> { Seed::Completions::Types::CompletionEvent }, key: "COMPLETION"

        member -> { Seed::Completions::Types::ErrorEvent }, key: "ERROR"
      end
    end
  end
end
