# frozen_string_literal: true

module Seed
    module Types
        class InternalError < Internal::Types::Model
            field :exception_info, Seed::Submission::ExceptionInfo, optional: false, nullable: false

    end
end
