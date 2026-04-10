# frozen_string_literal: true

module Seed
  module Types
    class SubmissionStatusV2 < Internal::Types::Model
      extend Seed::Internal::Types::Union

      member -> { Seed::Types::SubmissionStatusV2Zero }
      member -> { Seed::Types::SubmissionStatusV2One }
    end
  end
end
