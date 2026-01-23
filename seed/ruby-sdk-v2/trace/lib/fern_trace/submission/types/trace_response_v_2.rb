# frozen_string_literal: true

module FernTrace
  module Submission
    module Types
      class TraceResponseV2 < Internal::Types::Model
        field :submission_id, -> { String }, optional: false, nullable: false, api_name: "submissionId"
        field :line_number, -> { Integer }, optional: false, nullable: false, api_name: "lineNumber"
        field :file, -> { FernTrace::Submission::Types::TracedFile }, optional: false, nullable: false
        field :return_value, -> { FernTrace::Commons::Types::DebugVariableValue }, optional: true, nullable: false, api_name: "returnValue"
        field :expression_location, -> { FernTrace::Submission::Types::ExpressionLocation }, optional: true, nullable: false, api_name: "expressionLocation"
        field :stack, -> { FernTrace::Submission::Types::StackInformation }, optional: false, nullable: false
        field :stdout, -> { String }, optional: true, nullable: false
      end
    end
  end
end
