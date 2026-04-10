# frozen_string_literal: true

module Seed
  module Types
    class SubmissionStatusV2One < Internal::Types::Model
      field :type, -> { Seed::Types::SubmissionStatusV2OneType }, optional: false, nullable: false
    end
  end
end
