# frozen_string_literal: true

module Seed
  module Types
    # Too many fields for a one-parameter-per-field constructor; exercises builder-based fromXml.
    class Wide < Internal::Types::Model
      field :attr1, -> { String }, optional: true, nullable: false

      field :attr2, -> { String }, optional: true, nullable: false

      field :attr3, -> { String }, optional: true, nullable: false

      field :attr4, -> { String }, optional: true, nullable: false

      field :attr5, -> { String }, optional: true, nullable: false

      field :attr6, -> { String }, optional: true, nullable: false

      field :attr7, -> { String }, optional: true, nullable: false

      field :attr8, -> { String }, optional: true, nullable: false

      field :attr9, -> { String }, optional: true, nullable: false

      field :attr10, -> { String }, optional: true, nullable: false

      field :attr11, -> { String }, optional: true, nullable: false

      field :attr12, -> { String }, optional: true, nullable: false

      field :attr13, -> { String }, optional: true, nullable: false

      field :attr14, -> { String }, optional: true, nullable: false

      field :attr15, -> { String }, optional: true, nullable: false

      field :attr16, -> { String }, optional: true, nullable: false

      field :attr17, -> { String }, optional: true, nullable: false

      field :attr18, -> { String }, optional: true, nullable: false

      field :attr19, -> { String }, optional: true, nullable: false

      field :attr20, -> { String }, optional: true, nullable: false

      field :attr21, -> { String }, optional: true, nullable: false

      field :attr22, -> { String }, optional: true, nullable: false

      field :attr23, -> { String }, optional: true, nullable: false

      field :attr24, -> { String }, optional: true, nullable: false

      field :attr25, -> { String }, optional: true, nullable: false

      field :attr26, -> { String }, optional: true, nullable: false

      field :attr27, -> { String }, optional: true, nullable: false

      field :attr28, -> { String }, optional: true, nullable: false

      field :attr29, -> { String }, optional: true, nullable: false

      field :attr30, -> { String }, optional: true, nullable: false

      field :attr31, -> { String }, optional: true, nullable: false

      field :attr32, -> { String }, optional: true, nullable: false

      field :attr33, -> { String }, optional: true, nullable: false

      field :attr34, -> { String }, optional: true, nullable: false

      field :attr35, -> { String }, optional: true, nullable: false

      field :attr36, -> { String }, optional: true, nullable: false

      field :attr37, -> { String }, optional: true, nullable: false

      field :attr38, -> { String }, optional: true, nullable: false

      field :attr39, -> { String }, optional: true, nullable: false

      field :attr40, -> { String }, optional: true, nullable: false

      field :attr41, -> { String }, optional: true, nullable: false

      field :attr42, -> { String }, optional: true, nullable: false

      field :attr43, -> { String }, optional: true, nullable: false

      field :attr44, -> { String }, optional: true, nullable: false

      field :attr45, -> { String }, optional: true, nullable: false

      field :attr46, -> { String }, optional: true, nullable: false

      field :attr47, -> { String }, optional: true, nullable: false

      field :attr48, -> { String }, optional: true, nullable: false

      field :attr49, -> { String }, optional: true, nullable: false

      field :attr50, -> { String }, optional: true, nullable: false

      field :attr51, -> { String }, optional: true, nullable: false

      field :attr52, -> { String }, optional: true, nullable: false

      field :attr53, -> { String }, optional: true, nullable: false

      field :attr54, -> { String }, optional: true, nullable: false

      field :attr55, -> { String }, optional: true, nullable: false

      field :attr56, -> { String }, optional: true, nullable: false

      field :attr57, -> { String }, optional: true, nullable: false

      field :attr58, -> { String }, optional: true, nullable: false

      field :attr59, -> { String }, optional: true, nullable: false

      field :attr60, -> { String }, optional: true, nullable: false

      field :attr61, -> { String }, optional: true, nullable: false

      field :attr62, -> { String }, optional: true, nullable: false

      field :attr63, -> { String }, optional: true, nullable: false

      field :attr64, -> { String }, optional: true, nullable: false

      field :children, -> { Internal::Types::Array[Seed::Types::Pause] }, optional: true, nullable: false

      include Seed::Internal::Xml::Serializable

      xml_element "Wide", root: true
      xml_attribute :attr1, "attr1", String
      xml_attribute :attr2, "attr2", String
      xml_attribute :attr3, "attr3", String
      xml_attribute :attr4, "attr4", String
      xml_attribute :attr5, "attr5", String
      xml_attribute :attr6, "attr6", String
      xml_attribute :attr7, "attr7", String
      xml_attribute :attr8, "attr8", String
      xml_attribute :attr9, "attr9", String
      xml_attribute :attr10, "attr10", String
      xml_attribute :attr11, "attr11", String
      xml_attribute :attr12, "attr12", String
      xml_attribute :attr13, "attr13", String
      xml_attribute :attr14, "attr14", String
      xml_attribute :attr15, "attr15", String
      xml_attribute :attr16, "attr16", String
      xml_attribute :attr17, "attr17", String
      xml_attribute :attr18, "attr18", String
      xml_attribute :attr19, "attr19", String
      xml_attribute :attr20, "attr20", String
      xml_attribute :attr21, "attr21", String
      xml_attribute :attr22, "attr22", String
      xml_attribute :attr23, "attr23", String
      xml_attribute :attr24, "attr24", String
      xml_attribute :attr25, "attr25", String
      xml_attribute :attr26, "attr26", String
      xml_attribute :attr27, "attr27", String
      xml_attribute :attr28, "attr28", String
      xml_attribute :attr29, "attr29", String
      xml_attribute :attr30, "attr30", String
      xml_attribute :attr31, "attr31", String
      xml_attribute :attr32, "attr32", String
      xml_attribute :attr33, "attr33", String
      xml_attribute :attr34, "attr34", String
      xml_attribute :attr35, "attr35", String
      xml_attribute :attr36, "attr36", String
      xml_attribute :attr37, "attr37", String
      xml_attribute :attr38, "attr38", String
      xml_attribute :attr39, "attr39", String
      xml_attribute :attr40, "attr40", String
      xml_attribute :attr41, "attr41", String
      xml_attribute :attr42, "attr42", String
      xml_attribute :attr43, "attr43", String
      xml_attribute :attr44, "attr44", String
      xml_attribute :attr45, "attr45", String
      xml_attribute :attr46, "attr46", String
      xml_attribute :attr47, "attr47", String
      xml_attribute :attr48, "attr48", String
      xml_attribute :attr49, "attr49", String
      xml_attribute :attr50, "attr50", String
      xml_attribute :attr51, "attr51", String
      xml_attribute :attr52, "attr52", String
      xml_attribute :attr53, "attr53", String
      xml_attribute :attr54, "attr54", String
      xml_attribute :attr55, "attr55", String
      xml_attribute :attr56, "attr56", String
      xml_attribute :attr57, "attr57", String
      xml_attribute :attr58, "attr58", String
      xml_attribute :attr59, "attr59", String
      xml_attribute :attr60, "attr60", String
      xml_attribute :attr61, "attr61", String
      xml_attribute :attr62, "attr62", String
      xml_attribute :attr63, "attr63", String
      xml_attribute :attr64, "attr64", String
      xml_child :children, -> { Seed::Types::Pause }, list: true

      # Appends a <Pause> child element and returns it. Pass an existing Pause to append it as-is.
      #
      # @param attributes [Hash] attribute values keyed by field name; unknown keys become extra attributes
      # @return [Pause]
      def pause(**attributes)
        child = Seed::Types::Pause.new(**attributes)
        self.children = [*children, child]
        child
      end
    end
  end
end
