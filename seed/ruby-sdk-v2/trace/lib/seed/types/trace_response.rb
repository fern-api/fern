# frozen_string_literal: true

module Seed
  module Types
    class TraceResponse < Internal::Types::Model
      field :submission_id, -> { String }, optional: false, nullable: false, api_name: "submissionId"
      field :line_number, -> { Integer }, optional: false, nullable: false, api_name: "lineNumber"
      field :return_value, -> { Seed::Types::DebugVariableValue }, optional: true, nullable: false, api_name: "returnValue"
      field :expression_location, -> { Seed::Types::ExpressionLocation }, optional: true, nullable: false, api_name: "expressionLocation"
      field :stack, -> { Seed::Types::StackInformation }, optional: false, nullable: false
      field :stdout, -> { String }, optional: true, nullable: false
    end
  end
end
