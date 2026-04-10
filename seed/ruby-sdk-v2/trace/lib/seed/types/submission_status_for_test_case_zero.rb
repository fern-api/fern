# frozen_string_literal: true

module Seed
  module Types
    class SubmissionStatusForTestCaseZero < Internal::Types::Model
      field :type, -> { Seed::Types::SubmissionStatusForTestCaseZeroType }, optional: false, nullable: false
    end
  end
end
