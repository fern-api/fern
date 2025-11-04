# frozen_string_literal: true

module Seed
  module Submission
    module Types
      class InternalError < Internal::Types::Model
        field :exception_info, lambda {
          Seed::Submission::Types::ExceptionInfo
        }, optional: false, nullable: false, api_name: "exceptionInfo"
      end
    end
  end
end
