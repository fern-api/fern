# frozen_string_literal: true

module Seed
  module Types
    class InvalidRequestResponse < Internal::Types::Model
      field :request, -> { Seed::Types::SubmissionRequest }, optional: false, nullable: false
      field :cause, -> { Seed::Types::InvalidRequestCause }, optional: false, nullable: false
    end
  end
end
