# frozen_string_literal: true

module Seed
  module Types
    module CompletionFullResponseFinishReason
      extend Seed::Internal::Types::Enum

      COMPLETE = "complete"
      LENGTH = "length"
      ERROR = "error"
    end
  end
end
