# frozen_string_literal: true

module Seed
  module Types
    class SubmissionRequestType < Internal::Types::Model
      field :type, -> { Seed::Types::SubmissionRequestTypeType }, optional: false, nullable: false
    end
  end
end
