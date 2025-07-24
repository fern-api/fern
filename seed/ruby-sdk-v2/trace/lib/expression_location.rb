# frozen_string_literal: true

module Submission
    module Types
        class ExpressionLocation < Internal::Types::Model
            field :start, Integer, optional: true, nullable: true
            field :offset, Integer, optional: true, nullable: true
        end
    end
end
