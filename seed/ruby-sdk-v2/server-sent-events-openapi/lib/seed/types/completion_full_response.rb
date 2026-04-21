# frozen_string_literal: true

module Seed
  module Types
    # Full response returned when streaming is disabled.
    class CompletionFullResponse < Internal::Types::Model
      field :answer, -> { String }, optional: true, nullable: false

      field :finish_reason, -> { Seed::Types::CompletionFullResponseFinishReason }, optional: true, nullable: false, api_name: "finishReason"
    end
  end
end
