# frozen_string_literal: true

module Seed
  module Submission
    module Types
      class SubmissionCreateExecutionSessionRequest < Internal::Types::Model
        field :language, -> { Seed::Types::Language }, optional: false, nullable: false
      end
    end
  end
end
