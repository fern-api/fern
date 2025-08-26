# frozen_string_literal: true

module Seed
  module Submission
    module Types
      class InternalError < Internal::Types::Model
        field :exception_info, -> { Seed::Submission::Types::ExceptionInfo }, optional: false, nullable: false
      end
    end
  end
end
