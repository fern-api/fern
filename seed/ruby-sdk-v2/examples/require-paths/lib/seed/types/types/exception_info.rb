# frozen_string_literal: true

module Seed
  module Types
    module Types
      class ExceptionInfo < Internal::Types::Model
        field :exception_type, -> { String }, optional: false, nullable: false, api_name: "exceptionType"
        field :exception_message, -> { String }, optional: false, nullable: false, api_name: "exceptionMessage"
        field :exception_stacktrace, -> { String }, optional: false, nullable: false, api_name: "exceptionStacktrace"
      end
    end
  end
end
