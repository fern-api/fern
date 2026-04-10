# frozen_string_literal: true

module Seed
  module Types
    class SubmissionStatusForTestCaseType < Internal::Types::Model
      field :type, -> { Seed::Types::SubmissionStatusForTestCaseTypeType }, optional: false, nullable: false
      field :value, -> { Seed::Types::TestCaseGrade }, optional: true, nullable: false
    end
  end
end
