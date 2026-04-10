# frozen_string_literal: true

module Seed
  module Types
    class SubmissionResponse < Internal::Types::Model
      extend Seed::Internal::Types::Union

      member -> { Seed::Types::SubmissionResponseZero }
      member -> { Seed::Types::SubmissionResponseOne }
      member -> { Seed::Types::SubmissionResponseTwo }
      member -> { Seed::Types::SubmissionResponseThree }
      member -> { Seed::Types::SubmissionResponseFour }
      member -> { Seed::Types::SubmissionResponseFive }
    end
  end
end
