# frozen_string_literal: true

module Seed
  module Types
    class BadRequestErrorBody < Internal::Types::Model
      field :error_name, -> { Seed::Types::BadRequestErrorBodyErrorName }, optional: true, nullable: false, api_name: "errorName"
      field :content, -> { Seed::Types::PropertyBasedErrorTestBody }, optional: true, nullable: false
    end
  end
end
