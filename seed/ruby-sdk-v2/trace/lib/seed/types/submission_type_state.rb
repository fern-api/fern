# frozen_string_literal: true

module Seed
  module Types
    class SubmissionTypeState < Internal::Types::Model
      extend Seed::Internal::Types::Union

      member -> { Seed::Types::SubmissionTypeStateZero }
      member -> { Seed::Types::SubmissionTypeStateOne }
    end
  end
end
