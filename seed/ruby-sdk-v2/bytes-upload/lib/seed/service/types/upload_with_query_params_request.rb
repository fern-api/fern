# frozen_string_literal: true

module Seed
  module Service
    module Types
      class UploadWithQueryParamsRequest < Internal::Types::Model
        field :model, -> { String }, optional: false, nullable: false

        field :language, -> { String }, optional: true, nullable: false
      end
    end
  end
end
