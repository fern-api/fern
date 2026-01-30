# frozen_string_literal: true

module Seed
  module Submission
    module Types
      class TestCaseGrade < Internal::Types::Model
        extend Seed::Internal::Types::Union

        discriminant :type

        member -> { Seed::Submission::Types::TestCaseHiddenGrade }, key: "HIDDEN"
        member -> { Seed::Submission::Types::TestCaseNonHiddenGrade }, key: "NON_HIDDEN"
      end
    end
  end
end
