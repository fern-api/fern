# frozen_string_literal: true

module Seed
  module Types
    class V2V3FunctionImplementation < Internal::Types::Model
      field :impl, -> { String }, optional: false, nullable: false
      field :imports, -> { String }, optional: true, nullable: false
    end
  end
end
