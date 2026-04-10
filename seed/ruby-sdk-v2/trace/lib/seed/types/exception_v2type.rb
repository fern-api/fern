# frozen_string_literal: true

module Seed
  module Types
    class ExceptionV2Type < Internal::Types::Model
      field :type, -> { Seed::Types::ExceptionV2TypeType }, optional: false, nullable: false
    end
  end
end
