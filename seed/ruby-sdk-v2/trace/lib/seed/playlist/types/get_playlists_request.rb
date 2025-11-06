# frozen_string_literal: true

module Seed
  module Playlist
    module Types
      class GetPlaylistsRequest < Internal::Types::Model
        field :service_param, -> { Integer }, optional: false, nullable: false, api_name: "serviceParam"
        field :limit, -> { Integer }, optional: true, nullable: false
        field :other_field, -> { String }, optional: false, nullable: false, api_name: "otherField"
        field :multi_line_docs, -> { String }, optional: false, nullable: false, api_name: "multiLineDocs"
        field :optional_multiple_field, lambda {
          String
        }, optional: true, nullable: false, api_name: "optionalMultipleField"
        field :multiple_field, -> { String }, optional: false, nullable: false, api_name: "multipleField"
      end
    end
  end
end
