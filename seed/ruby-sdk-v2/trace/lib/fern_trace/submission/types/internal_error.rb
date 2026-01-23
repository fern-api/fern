# frozen_string_literal: true

module FernTrace
  module Submission
    module Types
      class InternalError < Internal::Types::Model
        field :exception_info, -> { FernTrace::Submission::Types::ExceptionInfo }, optional: false, nullable: false, api_name: "exceptionInfo"
      end
    end
  end
end
