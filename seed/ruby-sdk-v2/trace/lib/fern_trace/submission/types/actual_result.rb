# frozen_string_literal: true

module FernTrace
  module Submission
    module Types
      class ActualResult < Internal::Types::Model
        extend FernTrace::Internal::Types::Union

        discriminant :type

        member -> { FernTrace::Commons::Types::VariableValue }, key: "VALUE"
        member -> { FernTrace::Submission::Types::ExceptionInfo }, key: "EXCEPTION"
        member -> { FernTrace::Submission::Types::ExceptionV2 }, key: "EXCEPTION_V_2"
      end
    end
  end
end
