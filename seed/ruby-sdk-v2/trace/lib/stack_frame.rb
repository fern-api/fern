# frozen_string_literal: true

module Submission
    module Types
        class StackFrame < Internal::Types::Model
            field :method_name, String, optional: true, nullable: true
            field :line_number, Integer, optional: true, nullable: true
            field :scopes, Array, optional: true, nullable: true
        end
    end
end
