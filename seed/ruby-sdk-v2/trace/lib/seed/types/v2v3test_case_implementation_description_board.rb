# frozen_string_literal: true

module Seed
  module Types
    class V2V3TestCaseImplementationDescriptionBoard < Internal::Types::Model
      extend Seed::Internal::Types::Union

      discriminant :type

      member -> { Seed::Types::V2V3TestCaseImplementationDescriptionBoardHTML }, key: "HTML"
      member -> { Seed::Types::V2V3TestCaseImplementationDescriptionBoardParamID }, key: "PARAM_ID"
    end
  end
end
