# frozen_string_literal: true

module Seed
  module Types
    class ProblemDescriptionBoard < Internal::Types::Model
      extend Seed::Internal::Types::Union

      discriminant :type

      member -> { Seed::Types::ProblemDescriptionBoardHTML }, key: "HTML"
      member -> { Seed::Types::ProblemDescriptionBoardVariable }, key: "VARIABLE"
      member -> { Seed::Types::ProblemDescriptionBoardTestCaseID }, key: "TEST_CASE_ID"
    end
  end
end
