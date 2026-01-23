# frozen_string_literal: true

module FernExamples
  module Types
    module Types
      class Exception < Internal::Types::Model
        extend FernExamples::Internal::Types::Union

        discriminant :type

        member -> { FernExamples::Types::Types::ExceptionInfo }, key: "GENERIC"
        member -> { Object }, key: "TIMEOUT"
      end
    end
  end
end
