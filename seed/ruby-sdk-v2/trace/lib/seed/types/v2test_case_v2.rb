# frozen_string_literal: true

module Seed
  module Types
    class V2TestCaseV2 < Internal::Types::Model
      field :metadata, -> { Seed::Types::V2TestCaseMetadata }, optional: false, nullable: false
      field :implementation, -> { Seed::Types::V2TestCaseImplementationReference }, optional: false, nullable: false
      field :arguments, -> { Internal::Types::Hash[String, Seed::Types::VariableValue] }, optional: false, nullable: false
      field :expects, -> { Seed::Types::V2TestCaseExpects }, optional: true, nullable: false
    end
  end
end
