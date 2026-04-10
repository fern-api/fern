# frozen_string_literal: true

module Seed
  module Service
    module Types
      class ServiceDownloadRequest < Internal::Types::Model
        field :id, -> { String }, optional: false, nullable: false
      end
    end
  end
end
