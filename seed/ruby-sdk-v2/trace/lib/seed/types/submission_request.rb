# frozen_string_literal: true

module Seed
  module Types
    class SubmissionRequest < Internal::Types::Model
      extend Seed::Internal::Types::Union

      member -> { Seed::Types::SubmissionRequestZero }
      member -> { Seed::Types::SubmissionRequestType }
      member -> { Seed::Types::SubmissionRequestTwo }
      member -> { Seed::Types::SubmissionRequestThree }
      member -> { Seed::Types::SubmissionRequestFour }
    end
  end
end
