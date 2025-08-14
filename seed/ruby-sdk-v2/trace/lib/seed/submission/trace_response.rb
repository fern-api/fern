# frozen_string_literal: true

module Seed
    module Types
        class TraceResponse < Internal::Types::Model
            field :submission_id, String, optional: false, nullable: false
            field :line_number, Integer, optional: false, nullable: false
            field :return_value, Seed::Commons::DebugVariableValue, optional: true, nullable: false
            field :expression_location, Seed::Submission::ExpressionLocation, optional: true, nullable: false
            field :stack, Seed::Submission::StackInformation, optional: false, nullable: false
            field :stdout, String, optional: true, nullable: false

    end
end
