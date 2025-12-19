# frozen_string_literal: true

module Seed
  module Types
    module Types
      class Exception < Internal::Types::Model
        extend Seed::Internal::Types::Union

        discriminant :type

        member -> { Seed::Types::Types::ExceptionInfo }, key: "GENERIC"
        member -> { Object }, key: "TIMEOUT"
      end
    end
  end
end
