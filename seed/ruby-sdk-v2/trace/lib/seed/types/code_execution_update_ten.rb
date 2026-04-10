# frozen_string_literal: true

module Seed
  module Types
    class CodeExecutionUpdateTen < Internal::Types::Model
      field :type, -> { Seed::Types::CodeExecutionUpdateTenType }, optional: false, nullable: false
    end
  end
end
