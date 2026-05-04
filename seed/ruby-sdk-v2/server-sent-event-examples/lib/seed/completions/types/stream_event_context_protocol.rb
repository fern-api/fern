# frozen_string_literal: true

module Seed
  module Completions
    module Types
      class StreamEventContextProtocol < Internal::Types::Model
        extend Seed::Internal::Types::Union

        discriminant :event

        member -> { Seed::Completions::Types::CompletionEvent }, key: "COMPLETION"

        member -> { Seed::Completions::Types::ErrorEvent }, key: "ERROR"

        member -> { Seed::Completions::Types::EventEvent }, key: "EVENT"
      end
    end
  end
end
