# frozen_string_literal: true

module Seed
  module Types
    class V2TestCaseImplementationDescriptionBoard < Internal::Types::Model
      extend Seed::Internal::Types::Union

      discriminant :type

      member -> { Seed::Types::V2TestCaseImplementationDescriptionBoardHTML }, key: "HTML"
      member -> { Seed::Types::V2TestCaseImplementationDescriptionBoardParamID }, key: "PARAM_ID"
    end
  end
end
