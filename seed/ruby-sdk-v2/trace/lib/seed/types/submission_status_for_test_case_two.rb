# frozen_string_literal: true

module Seed
  module Types
    class SubmissionStatusForTestCaseTwo < Internal::Types::Model
      field :type, -> { Seed::Types::SubmissionStatusForTestCaseTwoType }, optional: false, nullable: false
    end
  end
end
