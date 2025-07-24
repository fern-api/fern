# frozen_string_literal: true

module Submission
    module Types
        class RuntimeError < Internal::Types::Model
            field :message, String, optional: true, nullable: true
        end
    end
end
