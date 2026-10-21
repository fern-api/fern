# frozen_string_literal: true

require_relative "../.."

module Seed
  module Commons
    module Types
      class FileInfo < Internal::Types::Model
        field :filename, -> { String }, optional: false, nullable: false

        field :contents, -> { String }, optional: false, nullable: false
      end
    end
  end
end
