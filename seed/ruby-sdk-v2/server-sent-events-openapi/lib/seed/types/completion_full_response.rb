# frozen_string_literal: true

require_relative ".."

module Seed
  module Types
    # Full response returned when streaming is disabled.
    class CompletionFullResponse < Internal::Types::Model
      field :answer, -> { String }, optional: true, nullable: false

      field :finish_reason, -> { Seed::Types::CompletionFullResponseFinishReason }, optional: true, nullable: false, api_name: "finishReason"
    end
  end
end
