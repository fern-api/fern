# frozen_string_literal: true

module Seed
  module Types
    class UnauthorizedErrorBody < Internal::Types::Model
      field :error_name, -> { Seed::Types::UnauthorizedErrorBodyErrorName }, optional: true, nullable: false, api_name: "errorName"
    end
  end
end
