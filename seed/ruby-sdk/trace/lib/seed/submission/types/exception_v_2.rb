# frozen_string_literal: true

module Seed
  module Submission
    module Types
      class ExceptionV2 < Internal::Types::Model
        extend Seed::Internal::Types::Union

        discriminant :type

        member -> { Seed::Submission::Types::ExceptionInfo }, key: "GENERIC"
        member -> { Object }, key: "TIMEOUT"
      end
    end
  end
end
