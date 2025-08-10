# frozen_string_literal: true

module Submission
    module Types
        class InternalError < Internal::Types::Model
            field :exception_info, ExceptionInfo, optional: true, nullable: true
        end
    end
end
