# frozen_string_literal: true

module Seed
  module Types
    class NotFoundErrorBody < Internal::Types::Model
      field :error_name, -> { Seed::Types::NotFoundErrorBodyErrorName }, optional: true, nullable: false, api_name: "errorName"
      field :content, -> { Seed::Types::PlaylistIDNotFoundErrorBody }, optional: true, nullable: false
    end
  end
end
