# frozen_string_literal: true

module Seed
  module Submission
    module Types
      class ActualResult < Internal::Types::Model
        extend Seed::Internal::Types::Union

        discriminant :type

        member -> { Seed::Commons::Types::VariableValue }, key: "VALUE"
        member -> { Seed::Submission::Types::ExceptionInfo }, key: "EXCEPTION"
        member -> { Seed::Submission::Types::ExceptionV2 }, key: "EXCEPTION_V_2"
      end
    end
  end
end
