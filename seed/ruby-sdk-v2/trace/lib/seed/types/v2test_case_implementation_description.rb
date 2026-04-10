# frozen_string_literal: true

module Seed
  module Types
    class V2TestCaseImplementationDescription < Internal::Types::Model
      field :boards, -> { Internal::Types::Array[Seed::Types::V2TestCaseImplementationDescriptionBoard] }, optional: false, nullable: false
    end
  end
end
