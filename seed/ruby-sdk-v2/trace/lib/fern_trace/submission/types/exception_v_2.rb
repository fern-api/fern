# frozen_string_literal: true

module FernTrace
  module Submission
    module Types
      class ExceptionV2 < Internal::Types::Model
        extend FernTrace::Internal::Types::Union

        discriminant :type

        member -> { FernTrace::Submission::Types::ExceptionInfo }, key: "GENERIC"
        member -> { Object }, key: "TIMEOUT"
      end
    end
  end
end
