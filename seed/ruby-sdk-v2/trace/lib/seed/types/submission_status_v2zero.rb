# frozen_string_literal: true

module Seed
  module Types
    class SubmissionStatusV2Zero < Internal::Types::Model
      field :type, -> { Seed::Types::SubmissionStatusV2ZeroType }, optional: false, nullable: false
    end
  end
end
