# frozen_string_literal: true

module Seed
  module Types
    class SubmissionTypeStateOne < Internal::Types::Model
      field :type, -> { Seed::Types::SubmissionTypeStateOneType }, optional: false, nullable: false
    end
  end
end
