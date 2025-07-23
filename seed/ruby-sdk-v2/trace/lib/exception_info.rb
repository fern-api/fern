# frozen_string_literal: true

module Submission
    module Types
        class ExceptionInfo < Internal::Types::Model
            field :exception_type, String, optional: true, nullable: true
            field :exception_message, String, optional: true, nullable: true
            field :exception_stacktrace, String, optional: true, nullable: true
        end
    end
end
