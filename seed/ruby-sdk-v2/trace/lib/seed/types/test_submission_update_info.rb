# frozen_string_literal: true

module Seed
  module Types
    class TestSubmissionUpdateInfo < Internal::Types::Model
      extend Seed::Internal::Types::Union

      member -> { Seed::Types::TestSubmissionUpdateInfoZero }
      member -> { Seed::Types::TestSubmissionUpdateInfoOne }
      member -> { Seed::Types::TestSubmissionUpdateInfoTwo }
      member -> { Seed::Types::TestSubmissionUpdateInfoThree }
      member -> { Seed::Types::TestSubmissionUpdateInfoFour }
      member -> { Seed::Types::TestSubmissionUpdateInfoFive }
    end
  end
end
