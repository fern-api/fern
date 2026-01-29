# frozen_string_literal: true

module Seed
  module Submission
    module Types
      class GetTraceResponsesPageRequest < Internal::Types::Model
        field :offset, -> { Integer }, optional: true, nullable: false
      end
    end
  end
end
