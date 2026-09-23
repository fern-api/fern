using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using global::System.Xml.Linq;
using SeedApi.Core;

namespace SeedApi;

/// <summary>
/// Too many fields for a one-parameter-per-field constructor; exercises builder-based fromXml.
/// </summary>
[Serializable]
public record Wide : IJsonOnDeserialized, IXmlNode
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("attr1")]
    public string? Attr1 { get; set; }

    [JsonPropertyName("attr2")]
    public string? Attr2 { get; set; }

    [JsonPropertyName("attr3")]
    public string? Attr3 { get; set; }

    [JsonPropertyName("attr4")]
    public string? Attr4 { get; set; }

    [JsonPropertyName("attr5")]
    public string? Attr5 { get; set; }

    [JsonPropertyName("attr6")]
    public string? Attr6 { get; set; }

    [JsonPropertyName("attr7")]
    public string? Attr7 { get; set; }

    [JsonPropertyName("attr8")]
    public string? Attr8 { get; set; }

    [JsonPropertyName("attr9")]
    public string? Attr9 { get; set; }

    [JsonPropertyName("attr10")]
    public string? Attr10 { get; set; }

    [JsonPropertyName("attr11")]
    public string? Attr11 { get; set; }

    [JsonPropertyName("attr12")]
    public string? Attr12 { get; set; }

    [JsonPropertyName("attr13")]
    public string? Attr13 { get; set; }

    [JsonPropertyName("attr14")]
    public string? Attr14 { get; set; }

    [JsonPropertyName("attr15")]
    public string? Attr15 { get; set; }

    [JsonPropertyName("attr16")]
    public string? Attr16 { get; set; }

    [JsonPropertyName("attr17")]
    public string? Attr17 { get; set; }

    [JsonPropertyName("attr18")]
    public string? Attr18 { get; set; }

    [JsonPropertyName("attr19")]
    public string? Attr19 { get; set; }

    [JsonPropertyName("attr20")]
    public string? Attr20 { get; set; }

    [JsonPropertyName("attr21")]
    public string? Attr21 { get; set; }

    [JsonPropertyName("attr22")]
    public string? Attr22 { get; set; }

    [JsonPropertyName("attr23")]
    public string? Attr23 { get; set; }

    [JsonPropertyName("attr24")]
    public string? Attr24 { get; set; }

    [JsonPropertyName("attr25")]
    public string? Attr25 { get; set; }

    [JsonPropertyName("attr26")]
    public string? Attr26 { get; set; }

    [JsonPropertyName("attr27")]
    public string? Attr27 { get; set; }

    [JsonPropertyName("attr28")]
    public string? Attr28 { get; set; }

    [JsonPropertyName("attr29")]
    public string? Attr29 { get; set; }

    [JsonPropertyName("attr30")]
    public string? Attr30 { get; set; }

    [JsonPropertyName("attr31")]
    public string? Attr31 { get; set; }

    [JsonPropertyName("attr32")]
    public string? Attr32 { get; set; }

    [JsonPropertyName("attr33")]
    public string? Attr33 { get; set; }

    [JsonPropertyName("attr34")]
    public string? Attr34 { get; set; }

    [JsonPropertyName("attr35")]
    public string? Attr35 { get; set; }

    [JsonPropertyName("attr36")]
    public string? Attr36 { get; set; }

    [JsonPropertyName("attr37")]
    public string? Attr37 { get; set; }

    [JsonPropertyName("attr38")]
    public string? Attr38 { get; set; }

    [JsonPropertyName("attr39")]
    public string? Attr39 { get; set; }

    [JsonPropertyName("attr40")]
    public string? Attr40 { get; set; }

    [JsonPropertyName("attr41")]
    public string? Attr41 { get; set; }

    [JsonPropertyName("attr42")]
    public string? Attr42 { get; set; }

    [JsonPropertyName("attr43")]
    public string? Attr43 { get; set; }

    [JsonPropertyName("attr44")]
    public string? Attr44 { get; set; }

    [JsonPropertyName("attr45")]
    public string? Attr45 { get; set; }

    [JsonPropertyName("attr46")]
    public string? Attr46 { get; set; }

    [JsonPropertyName("attr47")]
    public string? Attr47 { get; set; }

    [JsonPropertyName("attr48")]
    public string? Attr48 { get; set; }

    [JsonPropertyName("attr49")]
    public string? Attr49 { get; set; }

    [JsonPropertyName("attr50")]
    public string? Attr50 { get; set; }

    [JsonPropertyName("attr51")]
    public string? Attr51 { get; set; }

    [JsonPropertyName("attr52")]
    public string? Attr52 { get; set; }

    [JsonPropertyName("attr53")]
    public string? Attr53 { get; set; }

    [JsonPropertyName("attr54")]
    public string? Attr54 { get; set; }

    [JsonPropertyName("attr55")]
    public string? Attr55 { get; set; }

    [JsonPropertyName("attr56")]
    public string? Attr56 { get; set; }

    [JsonPropertyName("attr57")]
    public string? Attr57 { get; set; }

    [JsonPropertyName("attr58")]
    public string? Attr58 { get; set; }

    [JsonPropertyName("attr59")]
    public string? Attr59 { get; set; }

    [JsonPropertyName("attr60")]
    public string? Attr60 { get; set; }

    [JsonPropertyName("attr61")]
    public string? Attr61 { get; set; }

    [JsonPropertyName("attr62")]
    public string? Attr62 { get; set; }

    [JsonPropertyName("attr63")]
    public string? Attr63 { get; set; }

    [JsonPropertyName("attr64")]
    public string? Attr64 { get; set; }

    [JsonPropertyName("attr65")]
    public string? Attr65 { get; set; }

    [JsonPropertyName("attr66")]
    public string? Attr66 { get; set; }

    [JsonPropertyName("attr67")]
    public string? Attr67 { get; set; }

    [JsonPropertyName("attr68")]
    public string? Attr68 { get; set; }

    [JsonPropertyName("attr69")]
    public string? Attr69 { get; set; }

    [JsonPropertyName("attr70")]
    public string? Attr70 { get; set; }

    [JsonPropertyName("attr71")]
    public string? Attr71 { get; set; }

    [JsonPropertyName("attr72")]
    public string? Attr72 { get; set; }

    [JsonPropertyName("attr73")]
    public string? Attr73 { get; set; }

    [JsonPropertyName("attr74")]
    public string? Attr74 { get; set; }

    [JsonPropertyName("attr75")]
    public string? Attr75 { get; set; }

    [JsonPropertyName("attr76")]
    public string? Attr76 { get; set; }

    [JsonPropertyName("attr77")]
    public string? Attr77 { get; set; }

    [JsonPropertyName("attr78")]
    public string? Attr78 { get; set; }

    [JsonPropertyName("attr79")]
    public string? Attr79 { get; set; }

    [JsonPropertyName("attr80")]
    public string? Attr80 { get; set; }

    [JsonPropertyName("attr81")]
    public string? Attr81 { get; set; }

    [JsonPropertyName("attr82")]
    public string? Attr82 { get; set; }

    [JsonPropertyName("attr83")]
    public string? Attr83 { get; set; }

    [JsonPropertyName("attr84")]
    public string? Attr84 { get; set; }

    [JsonPropertyName("attr85")]
    public string? Attr85 { get; set; }

    [JsonPropertyName("attr86")]
    public string? Attr86 { get; set; }

    [JsonPropertyName("attr87")]
    public string? Attr87 { get; set; }

    [JsonPropertyName("attr88")]
    public string? Attr88 { get; set; }

    [JsonPropertyName("attr89")]
    public string? Attr89 { get; set; }

    [JsonPropertyName("attr90")]
    public string? Attr90 { get; set; }

    [JsonPropertyName("attr91")]
    public string? Attr91 { get; set; }

    [JsonPropertyName("attr92")]
    public string? Attr92 { get; set; }

    [JsonPropertyName("attr93")]
    public string? Attr93 { get; set; }

    [JsonPropertyName("attr94")]
    public string? Attr94 { get; set; }

    [JsonPropertyName("attr95")]
    public string? Attr95 { get; set; }

    [JsonPropertyName("attr96")]
    public string? Attr96 { get; set; }

    [JsonPropertyName("attr97")]
    public string? Attr97 { get; set; }

    [JsonPropertyName("attr98")]
    public string? Attr98 { get; set; }

    [JsonPropertyName("attr99")]
    public string? Attr99 { get; set; }

    [JsonPropertyName("attr100")]
    public string? Attr100 { get; set; }

    [JsonPropertyName("attr101")]
    public string? Attr101 { get; set; }

    [JsonPropertyName("attr102")]
    public string? Attr102 { get; set; }

    [JsonPropertyName("attr103")]
    public string? Attr103 { get; set; }

    [JsonPropertyName("attr104")]
    public string? Attr104 { get; set; }

    [JsonPropertyName("attr105")]
    public string? Attr105 { get; set; }

    [JsonPropertyName("attr106")]
    public string? Attr106 { get; set; }

    [JsonPropertyName("attr107")]
    public string? Attr107 { get; set; }

    [JsonPropertyName("attr108")]
    public string? Attr108 { get; set; }

    [JsonPropertyName("attr109")]
    public string? Attr109 { get; set; }

    [JsonPropertyName("attr110")]
    public string? Attr110 { get; set; }

    [JsonPropertyName("attr111")]
    public string? Attr111 { get; set; }

    [JsonPropertyName("attr112")]
    public string? Attr112 { get; set; }

    [JsonPropertyName("attr113")]
    public string? Attr113 { get; set; }

    [JsonPropertyName("attr114")]
    public string? Attr114 { get; set; }

    [JsonPropertyName("attr115")]
    public string? Attr115 { get; set; }

    [JsonPropertyName("attr116")]
    public string? Attr116 { get; set; }

    [JsonPropertyName("attr117")]
    public string? Attr117 { get; set; }

    [JsonPropertyName("attr118")]
    public string? Attr118 { get; set; }

    [JsonPropertyName("attr119")]
    public string? Attr119 { get; set; }

    [JsonPropertyName("attr120")]
    public string? Attr120 { get; set; }

    [JsonPropertyName("attr121")]
    public string? Attr121 { get; set; }

    [JsonPropertyName("attr122")]
    public string? Attr122 { get; set; }

    [JsonPropertyName("attr123")]
    public string? Attr123 { get; set; }

    [JsonPropertyName("attr124")]
    public string? Attr124 { get; set; }

    [JsonPropertyName("attr125")]
    public string? Attr125 { get; set; }

    [JsonPropertyName("attr126")]
    public string? Attr126 { get; set; }

    [JsonPropertyName("attr127")]
    public string? Attr127 { get; set; }

    [JsonPropertyName("attr128")]
    public string? Attr128 { get; set; }

    [JsonPropertyName("attr129")]
    public string? Attr129 { get; set; }

    [JsonPropertyName("attr130")]
    public string? Attr130 { get; set; }

    [JsonPropertyName("attr131")]
    public string? Attr131 { get; set; }

    [JsonPropertyName("attr132")]
    public string? Attr132 { get; set; }

    [JsonPropertyName("attr133")]
    public string? Attr133 { get; set; }

    [JsonPropertyName("attr134")]
    public string? Attr134 { get; set; }

    [JsonPropertyName("attr135")]
    public string? Attr135 { get; set; }

    [JsonPropertyName("attr136")]
    public string? Attr136 { get; set; }

    [JsonPropertyName("attr137")]
    public string? Attr137 { get; set; }

    [JsonPropertyName("attr138")]
    public string? Attr138 { get; set; }

    [JsonPropertyName("attr139")]
    public string? Attr139 { get; set; }

    [JsonPropertyName("attr140")]
    public string? Attr140 { get; set; }

    [JsonPropertyName("attr141")]
    public string? Attr141 { get; set; }

    [JsonPropertyName("attr142")]
    public string? Attr142 { get; set; }

    [JsonPropertyName("attr143")]
    public string? Attr143 { get; set; }

    [JsonPropertyName("attr144")]
    public string? Attr144 { get; set; }

    [JsonPropertyName("attr145")]
    public string? Attr145 { get; set; }

    [JsonPropertyName("attr146")]
    public string? Attr146 { get; set; }

    [JsonPropertyName("attr147")]
    public string? Attr147 { get; set; }

    [JsonPropertyName("attr148")]
    public string? Attr148 { get; set; }

    [JsonPropertyName("attr149")]
    public string? Attr149 { get; set; }

    [JsonPropertyName("attr150")]
    public string? Attr150 { get; set; }

    [JsonPropertyName("attr151")]
    public string? Attr151 { get; set; }

    [JsonPropertyName("attr152")]
    public string? Attr152 { get; set; }

    [JsonPropertyName("attr153")]
    public string? Attr153 { get; set; }

    [JsonPropertyName("attr154")]
    public string? Attr154 { get; set; }

    [JsonPropertyName("attr155")]
    public string? Attr155 { get; set; }

    [JsonPropertyName("attr156")]
    public string? Attr156 { get; set; }

    [JsonPropertyName("attr157")]
    public string? Attr157 { get; set; }

    [JsonPropertyName("attr158")]
    public string? Attr158 { get; set; }

    [JsonPropertyName("attr159")]
    public string? Attr159 { get; set; }

    [JsonPropertyName("attr160")]
    public string? Attr160 { get; set; }

    [JsonPropertyName("attr161")]
    public string? Attr161 { get; set; }

    [JsonPropertyName("attr162")]
    public string? Attr162 { get; set; }

    [JsonPropertyName("attr163")]
    public string? Attr163 { get; set; }

    [JsonPropertyName("attr164")]
    public string? Attr164 { get; set; }

    [JsonPropertyName("attr165")]
    public string? Attr165 { get; set; }

    [JsonPropertyName("attr166")]
    public string? Attr166 { get; set; }

    [JsonPropertyName("attr167")]
    public string? Attr167 { get; set; }

    [JsonPropertyName("attr168")]
    public string? Attr168 { get; set; }

    [JsonPropertyName("attr169")]
    public string? Attr169 { get; set; }

    [JsonPropertyName("attr170")]
    public string? Attr170 { get; set; }

    [JsonPropertyName("attr171")]
    public string? Attr171 { get; set; }

    [JsonPropertyName("attr172")]
    public string? Attr172 { get; set; }

    [JsonPropertyName("attr173")]
    public string? Attr173 { get; set; }

    [JsonPropertyName("attr174")]
    public string? Attr174 { get; set; }

    [JsonPropertyName("attr175")]
    public string? Attr175 { get; set; }

    [JsonPropertyName("attr176")]
    public string? Attr176 { get; set; }

    [JsonPropertyName("attr177")]
    public string? Attr177 { get; set; }

    [JsonPropertyName("attr178")]
    public string? Attr178 { get; set; }

    [JsonPropertyName("attr179")]
    public string? Attr179 { get; set; }

    [JsonPropertyName("attr180")]
    public string? Attr180 { get; set; }

    [JsonPropertyName("attr181")]
    public string? Attr181 { get; set; }

    [JsonPropertyName("attr182")]
    public string? Attr182 { get; set; }

    [JsonPropertyName("attr183")]
    public string? Attr183 { get; set; }

    [JsonPropertyName("attr184")]
    public string? Attr184 { get; set; }

    [JsonPropertyName("attr185")]
    public string? Attr185 { get; set; }

    [JsonPropertyName("attr186")]
    public string? Attr186 { get; set; }

    [JsonPropertyName("attr187")]
    public string? Attr187 { get; set; }

    [JsonPropertyName("attr188")]
    public string? Attr188 { get; set; }

    [JsonPropertyName("attr189")]
    public string? Attr189 { get; set; }

    [JsonPropertyName("attr190")]
    public string? Attr190 { get; set; }

    [JsonPropertyName("attr191")]
    public string? Attr191 { get; set; }

    [JsonPropertyName("attr192")]
    public string? Attr192 { get; set; }

    [JsonPropertyName("attr193")]
    public string? Attr193 { get; set; }

    [JsonPropertyName("attr194")]
    public string? Attr194 { get; set; }

    [JsonPropertyName("attr195")]
    public string? Attr195 { get; set; }

    [JsonPropertyName("attr196")]
    public string? Attr196 { get; set; }

    [JsonPropertyName("attr197")]
    public string? Attr197 { get; set; }

    [JsonPropertyName("attr198")]
    public string? Attr198 { get; set; }

    [JsonPropertyName("attr199")]
    public string? Attr199 { get; set; }

    [JsonPropertyName("attr200")]
    public string? Attr200 { get; set; }

    [JsonPropertyName("attr201")]
    public string? Attr201 { get; set; }

    [JsonPropertyName("attr202")]
    public string? Attr202 { get; set; }

    [JsonPropertyName("attr203")]
    public string? Attr203 { get; set; }

    [JsonPropertyName("attr204")]
    public string? Attr204 { get; set; }

    [JsonPropertyName("attr205")]
    public string? Attr205 { get; set; }

    [JsonPropertyName("attr206")]
    public string? Attr206 { get; set; }

    [JsonPropertyName("attr207")]
    public string? Attr207 { get; set; }

    [JsonPropertyName("attr208")]
    public string? Attr208 { get; set; }

    [JsonPropertyName("attr209")]
    public string? Attr209 { get; set; }

    [JsonPropertyName("attr210")]
    public string? Attr210 { get; set; }

    [JsonPropertyName("attr211")]
    public string? Attr211 { get; set; }

    [JsonPropertyName("attr212")]
    public string? Attr212 { get; set; }

    [JsonPropertyName("attr213")]
    public string? Attr213 { get; set; }

    [JsonPropertyName("attr214")]
    public string? Attr214 { get; set; }

    [JsonPropertyName("attr215")]
    public string? Attr215 { get; set; }

    [JsonPropertyName("attr216")]
    public string? Attr216 { get; set; }

    [JsonPropertyName("attr217")]
    public string? Attr217 { get; set; }

    [JsonPropertyName("attr218")]
    public string? Attr218 { get; set; }

    [JsonPropertyName("attr219")]
    public string? Attr219 { get; set; }

    [JsonPropertyName("attr220")]
    public string? Attr220 { get; set; }

    [JsonPropertyName("attr221")]
    public string? Attr221 { get; set; }

    [JsonPropertyName("attr222")]
    public string? Attr222 { get; set; }

    [JsonPropertyName("attr223")]
    public string? Attr223 { get; set; }

    [JsonPropertyName("attr224")]
    public string? Attr224 { get; set; }

    [JsonPropertyName("attr225")]
    public string? Attr225 { get; set; }

    [JsonPropertyName("attr226")]
    public string? Attr226 { get; set; }

    [JsonPropertyName("attr227")]
    public string? Attr227 { get; set; }

    [JsonPropertyName("attr228")]
    public string? Attr228 { get; set; }

    [JsonPropertyName("attr229")]
    public string? Attr229 { get; set; }

    [JsonPropertyName("attr230")]
    public string? Attr230 { get; set; }

    [JsonPropertyName("attr231")]
    public string? Attr231 { get; set; }

    [JsonPropertyName("attr232")]
    public string? Attr232 { get; set; }

    [JsonPropertyName("attr233")]
    public string? Attr233 { get; set; }

    [JsonPropertyName("attr234")]
    public string? Attr234 { get; set; }

    [JsonPropertyName("attr235")]
    public string? Attr235 { get; set; }

    [JsonPropertyName("attr236")]
    public string? Attr236 { get; set; }

    [JsonPropertyName("attr237")]
    public string? Attr237 { get; set; }

    [JsonPropertyName("attr238")]
    public string? Attr238 { get; set; }

    [JsonPropertyName("attr239")]
    public string? Attr239 { get; set; }

    [JsonPropertyName("attr240")]
    public string? Attr240 { get; set; }

    [JsonPropertyName("attr241")]
    public string? Attr241 { get; set; }

    [JsonPropertyName("attr242")]
    public string? Attr242 { get; set; }

    [JsonPropertyName("attr243")]
    public string? Attr243 { get; set; }

    [JsonPropertyName("attr244")]
    public string? Attr244 { get; set; }

    [JsonPropertyName("attr245")]
    public string? Attr245 { get; set; }

    [JsonPropertyName("attr246")]
    public string? Attr246 { get; set; }

    [JsonPropertyName("attr247")]
    public string? Attr247 { get; set; }

    [JsonPropertyName("attr248")]
    public string? Attr248 { get; set; }

    [JsonPropertyName("attr249")]
    public string? Attr249 { get; set; }

    [JsonPropertyName("attr250")]
    public string? Attr250 { get; set; }

    [JsonPropertyName("attr251")]
    public string? Attr251 { get; set; }

    [JsonPropertyName("attr252")]
    public string? Attr252 { get; set; }

    [JsonPropertyName("attr253")]
    public string? Attr253 { get; set; }

    [JsonPropertyName("attr254")]
    public string? Attr254 { get; set; }

    [JsonPropertyName("attr255")]
    public string? Attr255 { get; set; }

    [JsonPropertyName("attr256")]
    public string? Attr256 { get; set; }

    [JsonPropertyName("children")]
    public IEnumerable<Pause>? Children { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <summary>
    /// XML attributes that are not part of the typed model. They are written back by ToXml().
    /// </summary>
    [JsonIgnore]
    public Dictionary<string, string> AdditionalAttributes { get; set; } = new();

    /// <summary>
    /// Child elements that are not part of the typed model. They are written back by ToXml().
    /// </summary>
    [JsonIgnore]
    public List<XmlElement> AdditionalChildren { get; set; } = new();

    /// <summary>
    /// Parses a <c>&lt;Wide&gt;</c> XML document. Throws <see cref="ArgumentException"/> if the XML is malformed or the root element does not match.
    /// </summary>
    public static Wide FromXml(string xml) => FromXElement(XmlUtils.ParseRoot(xml, "Wide"));

    /// <summary>
    /// Reads this value from an already-parsed XML element.
    /// </summary>
    public static Wide FromXElement(XElement element)
    {
        XmlUtils.RequireName(element, "Wide");
        var result = new Wide
        {
            Attr1 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr1")),
            Attr2 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr2")),
            Attr3 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr3")),
            Attr4 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr4")),
            Attr5 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr5")),
            Attr6 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr6")),
            Attr7 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr7")),
            Attr8 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr8")),
            Attr9 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr9")),
            Attr10 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr10")),
            Attr11 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr11")),
            Attr12 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr12")),
            Attr13 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr13")),
            Attr14 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr14")),
            Attr15 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr15")),
            Attr16 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr16")),
            Attr17 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr17")),
            Attr18 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr18")),
            Attr19 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr19")),
            Attr20 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr20")),
            Attr21 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr21")),
            Attr22 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr22")),
            Attr23 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr23")),
            Attr24 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr24")),
            Attr25 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr25")),
            Attr26 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr26")),
            Attr27 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr27")),
            Attr28 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr28")),
            Attr29 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr29")),
            Attr30 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr30")),
            Attr31 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr31")),
            Attr32 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr32")),
            Attr33 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr33")),
            Attr34 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr34")),
            Attr35 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr35")),
            Attr36 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr36")),
            Attr37 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr37")),
            Attr38 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr38")),
            Attr39 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr39")),
            Attr40 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr40")),
            Attr41 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr41")),
            Attr42 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr42")),
            Attr43 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr43")),
            Attr44 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr44")),
            Attr45 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr45")),
            Attr46 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr46")),
            Attr47 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr47")),
            Attr48 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr48")),
            Attr49 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr49")),
            Attr50 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr50")),
            Attr51 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr51")),
            Attr52 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr52")),
            Attr53 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr53")),
            Attr54 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr54")),
            Attr55 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr55")),
            Attr56 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr56")),
            Attr57 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr57")),
            Attr58 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr58")),
            Attr59 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr59")),
            Attr60 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr60")),
            Attr61 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr61")),
            Attr62 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr62")),
            Attr63 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr63")),
            Attr64 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr64")),
            Attr65 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr65")),
            Attr66 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr66")),
            Attr67 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr67")),
            Attr68 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr68")),
            Attr69 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr69")),
            Attr70 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr70")),
            Attr71 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr71")),
            Attr72 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr72")),
            Attr73 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr73")),
            Attr74 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr74")),
            Attr75 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr75")),
            Attr76 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr76")),
            Attr77 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr77")),
            Attr78 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr78")),
            Attr79 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr79")),
            Attr80 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr80")),
            Attr81 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr81")),
            Attr82 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr82")),
            Attr83 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr83")),
            Attr84 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr84")),
            Attr85 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr85")),
            Attr86 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr86")),
            Attr87 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr87")),
            Attr88 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr88")),
            Attr89 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr89")),
            Attr90 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr90")),
            Attr91 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr91")),
            Attr92 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr92")),
            Attr93 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr93")),
            Attr94 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr94")),
            Attr95 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr95")),
            Attr96 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr96")),
            Attr97 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr97")),
            Attr98 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr98")),
            Attr99 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr99")),
            Attr100 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr100")),
            Attr101 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr101")),
            Attr102 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr102")),
            Attr103 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr103")),
            Attr104 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr104")),
            Attr105 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr105")),
            Attr106 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr106")),
            Attr107 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr107")),
            Attr108 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr108")),
            Attr109 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr109")),
            Attr110 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr110")),
            Attr111 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr111")),
            Attr112 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr112")),
            Attr113 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr113")),
            Attr114 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr114")),
            Attr115 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr115")),
            Attr116 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr116")),
            Attr117 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr117")),
            Attr118 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr118")),
            Attr119 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr119")),
            Attr120 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr120")),
            Attr121 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr121")),
            Attr122 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr122")),
            Attr123 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr123")),
            Attr124 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr124")),
            Attr125 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr125")),
            Attr126 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr126")),
            Attr127 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr127")),
            Attr128 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr128")),
            Attr129 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr129")),
            Attr130 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr130")),
            Attr131 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr131")),
            Attr132 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr132")),
            Attr133 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr133")),
            Attr134 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr134")),
            Attr135 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr135")),
            Attr136 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr136")),
            Attr137 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr137")),
            Attr138 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr138")),
            Attr139 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr139")),
            Attr140 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr140")),
            Attr141 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr141")),
            Attr142 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr142")),
            Attr143 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr143")),
            Attr144 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr144")),
            Attr145 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr145")),
            Attr146 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr146")),
            Attr147 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr147")),
            Attr148 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr148")),
            Attr149 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr149")),
            Attr150 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr150")),
            Attr151 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr151")),
            Attr152 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr152")),
            Attr153 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr153")),
            Attr154 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr154")),
            Attr155 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr155")),
            Attr156 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr156")),
            Attr157 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr157")),
            Attr158 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr158")),
            Attr159 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr159")),
            Attr160 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr160")),
            Attr161 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr161")),
            Attr162 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr162")),
            Attr163 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr163")),
            Attr164 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr164")),
            Attr165 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr165")),
            Attr166 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr166")),
            Attr167 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr167")),
            Attr168 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr168")),
            Attr169 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr169")),
            Attr170 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr170")),
            Attr171 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr171")),
            Attr172 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr172")),
            Attr173 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr173")),
            Attr174 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr174")),
            Attr175 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr175")),
            Attr176 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr176")),
            Attr177 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr177")),
            Attr178 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr178")),
            Attr179 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr179")),
            Attr180 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr180")),
            Attr181 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr181")),
            Attr182 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr182")),
            Attr183 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr183")),
            Attr184 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr184")),
            Attr185 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr185")),
            Attr186 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr186")),
            Attr187 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr187")),
            Attr188 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr188")),
            Attr189 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr189")),
            Attr190 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr190")),
            Attr191 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr191")),
            Attr192 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr192")),
            Attr193 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr193")),
            Attr194 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr194")),
            Attr195 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr195")),
            Attr196 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr196")),
            Attr197 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr197")),
            Attr198 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr198")),
            Attr199 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr199")),
            Attr200 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr200")),
            Attr201 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr201")),
            Attr202 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr202")),
            Attr203 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr203")),
            Attr204 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr204")),
            Attr205 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr205")),
            Attr206 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr206")),
            Attr207 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr207")),
            Attr208 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr208")),
            Attr209 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr209")),
            Attr210 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr210")),
            Attr211 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr211")),
            Attr212 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr212")),
            Attr213 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr213")),
            Attr214 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr214")),
            Attr215 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr215")),
            Attr216 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr216")),
            Attr217 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr217")),
            Attr218 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr218")),
            Attr219 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr219")),
            Attr220 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr220")),
            Attr221 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr221")),
            Attr222 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr222")),
            Attr223 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr223")),
            Attr224 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr224")),
            Attr225 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr225")),
            Attr226 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr226")),
            Attr227 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr227")),
            Attr228 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr228")),
            Attr229 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr229")),
            Attr230 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr230")),
            Attr231 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr231")),
            Attr232 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr232")),
            Attr233 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr233")),
            Attr234 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr234")),
            Attr235 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr235")),
            Attr236 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr236")),
            Attr237 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr237")),
            Attr238 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr238")),
            Attr239 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr239")),
            Attr240 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr240")),
            Attr241 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr241")),
            Attr242 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr242")),
            Attr243 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr243")),
            Attr244 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr244")),
            Attr245 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr245")),
            Attr246 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr246")),
            Attr247 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr247")),
            Attr248 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr248")),
            Attr249 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr249")),
            Attr250 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr250")),
            Attr251 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr251")),
            Attr252 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr252")),
            Attr253 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr253")),
            Attr254 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr254")),
            Attr255 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr255")),
            Attr256 = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "attr256")),
            Children = XmlUtils.ParseChildren(
                element,
                new string[] { "Pause" },
                global::SeedApi.Pause.FromXElement
            ),
            AdditionalAttributes = XmlUtils.GetAdditionalAttributes(
                element,
                "attr1",
                "attr2",
                "attr3",
                "attr4",
                "attr5",
                "attr6",
                "attr7",
                "attr8",
                "attr9",
                "attr10",
                "attr11",
                "attr12",
                "attr13",
                "attr14",
                "attr15",
                "attr16",
                "attr17",
                "attr18",
                "attr19",
                "attr20",
                "attr21",
                "attr22",
                "attr23",
                "attr24",
                "attr25",
                "attr26",
                "attr27",
                "attr28",
                "attr29",
                "attr30",
                "attr31",
                "attr32",
                "attr33",
                "attr34",
                "attr35",
                "attr36",
                "attr37",
                "attr38",
                "attr39",
                "attr40",
                "attr41",
                "attr42",
                "attr43",
                "attr44",
                "attr45",
                "attr46",
                "attr47",
                "attr48",
                "attr49",
                "attr50",
                "attr51",
                "attr52",
                "attr53",
                "attr54",
                "attr55",
                "attr56",
                "attr57",
                "attr58",
                "attr59",
                "attr60",
                "attr61",
                "attr62",
                "attr63",
                "attr64",
                "attr65",
                "attr66",
                "attr67",
                "attr68",
                "attr69",
                "attr70",
                "attr71",
                "attr72",
                "attr73",
                "attr74",
                "attr75",
                "attr76",
                "attr77",
                "attr78",
                "attr79",
                "attr80",
                "attr81",
                "attr82",
                "attr83",
                "attr84",
                "attr85",
                "attr86",
                "attr87",
                "attr88",
                "attr89",
                "attr90",
                "attr91",
                "attr92",
                "attr93",
                "attr94",
                "attr95",
                "attr96",
                "attr97",
                "attr98",
                "attr99",
                "attr100",
                "attr101",
                "attr102",
                "attr103",
                "attr104",
                "attr105",
                "attr106",
                "attr107",
                "attr108",
                "attr109",
                "attr110",
                "attr111",
                "attr112",
                "attr113",
                "attr114",
                "attr115",
                "attr116",
                "attr117",
                "attr118",
                "attr119",
                "attr120",
                "attr121",
                "attr122",
                "attr123",
                "attr124",
                "attr125",
                "attr126",
                "attr127",
                "attr128",
                "attr129",
                "attr130",
                "attr131",
                "attr132",
                "attr133",
                "attr134",
                "attr135",
                "attr136",
                "attr137",
                "attr138",
                "attr139",
                "attr140",
                "attr141",
                "attr142",
                "attr143",
                "attr144",
                "attr145",
                "attr146",
                "attr147",
                "attr148",
                "attr149",
                "attr150",
                "attr151",
                "attr152",
                "attr153",
                "attr154",
                "attr155",
                "attr156",
                "attr157",
                "attr158",
                "attr159",
                "attr160",
                "attr161",
                "attr162",
                "attr163",
                "attr164",
                "attr165",
                "attr166",
                "attr167",
                "attr168",
                "attr169",
                "attr170",
                "attr171",
                "attr172",
                "attr173",
                "attr174",
                "attr175",
                "attr176",
                "attr177",
                "attr178",
                "attr179",
                "attr180",
                "attr181",
                "attr182",
                "attr183",
                "attr184",
                "attr185",
                "attr186",
                "attr187",
                "attr188",
                "attr189",
                "attr190",
                "attr191",
                "attr192",
                "attr193",
                "attr194",
                "attr195",
                "attr196",
                "attr197",
                "attr198",
                "attr199",
                "attr200",
                "attr201",
                "attr202",
                "attr203",
                "attr204",
                "attr205",
                "attr206",
                "attr207",
                "attr208",
                "attr209",
                "attr210",
                "attr211",
                "attr212",
                "attr213",
                "attr214",
                "attr215",
                "attr216",
                "attr217",
                "attr218",
                "attr219",
                "attr220",
                "attr221",
                "attr222",
                "attr223",
                "attr224",
                "attr225",
                "attr226",
                "attr227",
                "attr228",
                "attr229",
                "attr230",
                "attr231",
                "attr232",
                "attr233",
                "attr234",
                "attr235",
                "attr236",
                "attr237",
                "attr238",
                "attr239",
                "attr240",
                "attr241",
                "attr242",
                "attr243",
                "attr244",
                "attr245",
                "attr246",
                "attr247",
                "attr248",
                "attr249",
                "attr250",
                "attr251",
                "attr252",
                "attr253",
                "attr254",
                "attr255",
                "attr256"
            ),
            AdditionalChildren = XmlUtils.GetAdditionalChildren(element, new string[] { "Pause" }),
        };
        return result;
    }

    void IJsonOnDeserialized.OnDeserialized() =>
        AdditionalProperties.CopyFromExtensionData(_extensionData);

    /// <summary>
    /// Renders this value as an XML element.
    /// </summary>
    public XElement ToXElement()
    {
        var element = XmlUtils.CreateElement("Wide", null, null);
        XmlUtils.SetAttribute(element, "attr1", XmlUtils.ToXmlString(Attr1));
        XmlUtils.SetAttribute(element, "attr2", XmlUtils.ToXmlString(Attr2));
        XmlUtils.SetAttribute(element, "attr3", XmlUtils.ToXmlString(Attr3));
        XmlUtils.SetAttribute(element, "attr4", XmlUtils.ToXmlString(Attr4));
        XmlUtils.SetAttribute(element, "attr5", XmlUtils.ToXmlString(Attr5));
        XmlUtils.SetAttribute(element, "attr6", XmlUtils.ToXmlString(Attr6));
        XmlUtils.SetAttribute(element, "attr7", XmlUtils.ToXmlString(Attr7));
        XmlUtils.SetAttribute(element, "attr8", XmlUtils.ToXmlString(Attr8));
        XmlUtils.SetAttribute(element, "attr9", XmlUtils.ToXmlString(Attr9));
        XmlUtils.SetAttribute(element, "attr10", XmlUtils.ToXmlString(Attr10));
        XmlUtils.SetAttribute(element, "attr11", XmlUtils.ToXmlString(Attr11));
        XmlUtils.SetAttribute(element, "attr12", XmlUtils.ToXmlString(Attr12));
        XmlUtils.SetAttribute(element, "attr13", XmlUtils.ToXmlString(Attr13));
        XmlUtils.SetAttribute(element, "attr14", XmlUtils.ToXmlString(Attr14));
        XmlUtils.SetAttribute(element, "attr15", XmlUtils.ToXmlString(Attr15));
        XmlUtils.SetAttribute(element, "attr16", XmlUtils.ToXmlString(Attr16));
        XmlUtils.SetAttribute(element, "attr17", XmlUtils.ToXmlString(Attr17));
        XmlUtils.SetAttribute(element, "attr18", XmlUtils.ToXmlString(Attr18));
        XmlUtils.SetAttribute(element, "attr19", XmlUtils.ToXmlString(Attr19));
        XmlUtils.SetAttribute(element, "attr20", XmlUtils.ToXmlString(Attr20));
        XmlUtils.SetAttribute(element, "attr21", XmlUtils.ToXmlString(Attr21));
        XmlUtils.SetAttribute(element, "attr22", XmlUtils.ToXmlString(Attr22));
        XmlUtils.SetAttribute(element, "attr23", XmlUtils.ToXmlString(Attr23));
        XmlUtils.SetAttribute(element, "attr24", XmlUtils.ToXmlString(Attr24));
        XmlUtils.SetAttribute(element, "attr25", XmlUtils.ToXmlString(Attr25));
        XmlUtils.SetAttribute(element, "attr26", XmlUtils.ToXmlString(Attr26));
        XmlUtils.SetAttribute(element, "attr27", XmlUtils.ToXmlString(Attr27));
        XmlUtils.SetAttribute(element, "attr28", XmlUtils.ToXmlString(Attr28));
        XmlUtils.SetAttribute(element, "attr29", XmlUtils.ToXmlString(Attr29));
        XmlUtils.SetAttribute(element, "attr30", XmlUtils.ToXmlString(Attr30));
        XmlUtils.SetAttribute(element, "attr31", XmlUtils.ToXmlString(Attr31));
        XmlUtils.SetAttribute(element, "attr32", XmlUtils.ToXmlString(Attr32));
        XmlUtils.SetAttribute(element, "attr33", XmlUtils.ToXmlString(Attr33));
        XmlUtils.SetAttribute(element, "attr34", XmlUtils.ToXmlString(Attr34));
        XmlUtils.SetAttribute(element, "attr35", XmlUtils.ToXmlString(Attr35));
        XmlUtils.SetAttribute(element, "attr36", XmlUtils.ToXmlString(Attr36));
        XmlUtils.SetAttribute(element, "attr37", XmlUtils.ToXmlString(Attr37));
        XmlUtils.SetAttribute(element, "attr38", XmlUtils.ToXmlString(Attr38));
        XmlUtils.SetAttribute(element, "attr39", XmlUtils.ToXmlString(Attr39));
        XmlUtils.SetAttribute(element, "attr40", XmlUtils.ToXmlString(Attr40));
        XmlUtils.SetAttribute(element, "attr41", XmlUtils.ToXmlString(Attr41));
        XmlUtils.SetAttribute(element, "attr42", XmlUtils.ToXmlString(Attr42));
        XmlUtils.SetAttribute(element, "attr43", XmlUtils.ToXmlString(Attr43));
        XmlUtils.SetAttribute(element, "attr44", XmlUtils.ToXmlString(Attr44));
        XmlUtils.SetAttribute(element, "attr45", XmlUtils.ToXmlString(Attr45));
        XmlUtils.SetAttribute(element, "attr46", XmlUtils.ToXmlString(Attr46));
        XmlUtils.SetAttribute(element, "attr47", XmlUtils.ToXmlString(Attr47));
        XmlUtils.SetAttribute(element, "attr48", XmlUtils.ToXmlString(Attr48));
        XmlUtils.SetAttribute(element, "attr49", XmlUtils.ToXmlString(Attr49));
        XmlUtils.SetAttribute(element, "attr50", XmlUtils.ToXmlString(Attr50));
        XmlUtils.SetAttribute(element, "attr51", XmlUtils.ToXmlString(Attr51));
        XmlUtils.SetAttribute(element, "attr52", XmlUtils.ToXmlString(Attr52));
        XmlUtils.SetAttribute(element, "attr53", XmlUtils.ToXmlString(Attr53));
        XmlUtils.SetAttribute(element, "attr54", XmlUtils.ToXmlString(Attr54));
        XmlUtils.SetAttribute(element, "attr55", XmlUtils.ToXmlString(Attr55));
        XmlUtils.SetAttribute(element, "attr56", XmlUtils.ToXmlString(Attr56));
        XmlUtils.SetAttribute(element, "attr57", XmlUtils.ToXmlString(Attr57));
        XmlUtils.SetAttribute(element, "attr58", XmlUtils.ToXmlString(Attr58));
        XmlUtils.SetAttribute(element, "attr59", XmlUtils.ToXmlString(Attr59));
        XmlUtils.SetAttribute(element, "attr60", XmlUtils.ToXmlString(Attr60));
        XmlUtils.SetAttribute(element, "attr61", XmlUtils.ToXmlString(Attr61));
        XmlUtils.SetAttribute(element, "attr62", XmlUtils.ToXmlString(Attr62));
        XmlUtils.SetAttribute(element, "attr63", XmlUtils.ToXmlString(Attr63));
        XmlUtils.SetAttribute(element, "attr64", XmlUtils.ToXmlString(Attr64));
        XmlUtils.SetAttribute(element, "attr65", XmlUtils.ToXmlString(Attr65));
        XmlUtils.SetAttribute(element, "attr66", XmlUtils.ToXmlString(Attr66));
        XmlUtils.SetAttribute(element, "attr67", XmlUtils.ToXmlString(Attr67));
        XmlUtils.SetAttribute(element, "attr68", XmlUtils.ToXmlString(Attr68));
        XmlUtils.SetAttribute(element, "attr69", XmlUtils.ToXmlString(Attr69));
        XmlUtils.SetAttribute(element, "attr70", XmlUtils.ToXmlString(Attr70));
        XmlUtils.SetAttribute(element, "attr71", XmlUtils.ToXmlString(Attr71));
        XmlUtils.SetAttribute(element, "attr72", XmlUtils.ToXmlString(Attr72));
        XmlUtils.SetAttribute(element, "attr73", XmlUtils.ToXmlString(Attr73));
        XmlUtils.SetAttribute(element, "attr74", XmlUtils.ToXmlString(Attr74));
        XmlUtils.SetAttribute(element, "attr75", XmlUtils.ToXmlString(Attr75));
        XmlUtils.SetAttribute(element, "attr76", XmlUtils.ToXmlString(Attr76));
        XmlUtils.SetAttribute(element, "attr77", XmlUtils.ToXmlString(Attr77));
        XmlUtils.SetAttribute(element, "attr78", XmlUtils.ToXmlString(Attr78));
        XmlUtils.SetAttribute(element, "attr79", XmlUtils.ToXmlString(Attr79));
        XmlUtils.SetAttribute(element, "attr80", XmlUtils.ToXmlString(Attr80));
        XmlUtils.SetAttribute(element, "attr81", XmlUtils.ToXmlString(Attr81));
        XmlUtils.SetAttribute(element, "attr82", XmlUtils.ToXmlString(Attr82));
        XmlUtils.SetAttribute(element, "attr83", XmlUtils.ToXmlString(Attr83));
        XmlUtils.SetAttribute(element, "attr84", XmlUtils.ToXmlString(Attr84));
        XmlUtils.SetAttribute(element, "attr85", XmlUtils.ToXmlString(Attr85));
        XmlUtils.SetAttribute(element, "attr86", XmlUtils.ToXmlString(Attr86));
        XmlUtils.SetAttribute(element, "attr87", XmlUtils.ToXmlString(Attr87));
        XmlUtils.SetAttribute(element, "attr88", XmlUtils.ToXmlString(Attr88));
        XmlUtils.SetAttribute(element, "attr89", XmlUtils.ToXmlString(Attr89));
        XmlUtils.SetAttribute(element, "attr90", XmlUtils.ToXmlString(Attr90));
        XmlUtils.SetAttribute(element, "attr91", XmlUtils.ToXmlString(Attr91));
        XmlUtils.SetAttribute(element, "attr92", XmlUtils.ToXmlString(Attr92));
        XmlUtils.SetAttribute(element, "attr93", XmlUtils.ToXmlString(Attr93));
        XmlUtils.SetAttribute(element, "attr94", XmlUtils.ToXmlString(Attr94));
        XmlUtils.SetAttribute(element, "attr95", XmlUtils.ToXmlString(Attr95));
        XmlUtils.SetAttribute(element, "attr96", XmlUtils.ToXmlString(Attr96));
        XmlUtils.SetAttribute(element, "attr97", XmlUtils.ToXmlString(Attr97));
        XmlUtils.SetAttribute(element, "attr98", XmlUtils.ToXmlString(Attr98));
        XmlUtils.SetAttribute(element, "attr99", XmlUtils.ToXmlString(Attr99));
        XmlUtils.SetAttribute(element, "attr100", XmlUtils.ToXmlString(Attr100));
        XmlUtils.SetAttribute(element, "attr101", XmlUtils.ToXmlString(Attr101));
        XmlUtils.SetAttribute(element, "attr102", XmlUtils.ToXmlString(Attr102));
        XmlUtils.SetAttribute(element, "attr103", XmlUtils.ToXmlString(Attr103));
        XmlUtils.SetAttribute(element, "attr104", XmlUtils.ToXmlString(Attr104));
        XmlUtils.SetAttribute(element, "attr105", XmlUtils.ToXmlString(Attr105));
        XmlUtils.SetAttribute(element, "attr106", XmlUtils.ToXmlString(Attr106));
        XmlUtils.SetAttribute(element, "attr107", XmlUtils.ToXmlString(Attr107));
        XmlUtils.SetAttribute(element, "attr108", XmlUtils.ToXmlString(Attr108));
        XmlUtils.SetAttribute(element, "attr109", XmlUtils.ToXmlString(Attr109));
        XmlUtils.SetAttribute(element, "attr110", XmlUtils.ToXmlString(Attr110));
        XmlUtils.SetAttribute(element, "attr111", XmlUtils.ToXmlString(Attr111));
        XmlUtils.SetAttribute(element, "attr112", XmlUtils.ToXmlString(Attr112));
        XmlUtils.SetAttribute(element, "attr113", XmlUtils.ToXmlString(Attr113));
        XmlUtils.SetAttribute(element, "attr114", XmlUtils.ToXmlString(Attr114));
        XmlUtils.SetAttribute(element, "attr115", XmlUtils.ToXmlString(Attr115));
        XmlUtils.SetAttribute(element, "attr116", XmlUtils.ToXmlString(Attr116));
        XmlUtils.SetAttribute(element, "attr117", XmlUtils.ToXmlString(Attr117));
        XmlUtils.SetAttribute(element, "attr118", XmlUtils.ToXmlString(Attr118));
        XmlUtils.SetAttribute(element, "attr119", XmlUtils.ToXmlString(Attr119));
        XmlUtils.SetAttribute(element, "attr120", XmlUtils.ToXmlString(Attr120));
        XmlUtils.SetAttribute(element, "attr121", XmlUtils.ToXmlString(Attr121));
        XmlUtils.SetAttribute(element, "attr122", XmlUtils.ToXmlString(Attr122));
        XmlUtils.SetAttribute(element, "attr123", XmlUtils.ToXmlString(Attr123));
        XmlUtils.SetAttribute(element, "attr124", XmlUtils.ToXmlString(Attr124));
        XmlUtils.SetAttribute(element, "attr125", XmlUtils.ToXmlString(Attr125));
        XmlUtils.SetAttribute(element, "attr126", XmlUtils.ToXmlString(Attr126));
        XmlUtils.SetAttribute(element, "attr127", XmlUtils.ToXmlString(Attr127));
        XmlUtils.SetAttribute(element, "attr128", XmlUtils.ToXmlString(Attr128));
        XmlUtils.SetAttribute(element, "attr129", XmlUtils.ToXmlString(Attr129));
        XmlUtils.SetAttribute(element, "attr130", XmlUtils.ToXmlString(Attr130));
        XmlUtils.SetAttribute(element, "attr131", XmlUtils.ToXmlString(Attr131));
        XmlUtils.SetAttribute(element, "attr132", XmlUtils.ToXmlString(Attr132));
        XmlUtils.SetAttribute(element, "attr133", XmlUtils.ToXmlString(Attr133));
        XmlUtils.SetAttribute(element, "attr134", XmlUtils.ToXmlString(Attr134));
        XmlUtils.SetAttribute(element, "attr135", XmlUtils.ToXmlString(Attr135));
        XmlUtils.SetAttribute(element, "attr136", XmlUtils.ToXmlString(Attr136));
        XmlUtils.SetAttribute(element, "attr137", XmlUtils.ToXmlString(Attr137));
        XmlUtils.SetAttribute(element, "attr138", XmlUtils.ToXmlString(Attr138));
        XmlUtils.SetAttribute(element, "attr139", XmlUtils.ToXmlString(Attr139));
        XmlUtils.SetAttribute(element, "attr140", XmlUtils.ToXmlString(Attr140));
        XmlUtils.SetAttribute(element, "attr141", XmlUtils.ToXmlString(Attr141));
        XmlUtils.SetAttribute(element, "attr142", XmlUtils.ToXmlString(Attr142));
        XmlUtils.SetAttribute(element, "attr143", XmlUtils.ToXmlString(Attr143));
        XmlUtils.SetAttribute(element, "attr144", XmlUtils.ToXmlString(Attr144));
        XmlUtils.SetAttribute(element, "attr145", XmlUtils.ToXmlString(Attr145));
        XmlUtils.SetAttribute(element, "attr146", XmlUtils.ToXmlString(Attr146));
        XmlUtils.SetAttribute(element, "attr147", XmlUtils.ToXmlString(Attr147));
        XmlUtils.SetAttribute(element, "attr148", XmlUtils.ToXmlString(Attr148));
        XmlUtils.SetAttribute(element, "attr149", XmlUtils.ToXmlString(Attr149));
        XmlUtils.SetAttribute(element, "attr150", XmlUtils.ToXmlString(Attr150));
        XmlUtils.SetAttribute(element, "attr151", XmlUtils.ToXmlString(Attr151));
        XmlUtils.SetAttribute(element, "attr152", XmlUtils.ToXmlString(Attr152));
        XmlUtils.SetAttribute(element, "attr153", XmlUtils.ToXmlString(Attr153));
        XmlUtils.SetAttribute(element, "attr154", XmlUtils.ToXmlString(Attr154));
        XmlUtils.SetAttribute(element, "attr155", XmlUtils.ToXmlString(Attr155));
        XmlUtils.SetAttribute(element, "attr156", XmlUtils.ToXmlString(Attr156));
        XmlUtils.SetAttribute(element, "attr157", XmlUtils.ToXmlString(Attr157));
        XmlUtils.SetAttribute(element, "attr158", XmlUtils.ToXmlString(Attr158));
        XmlUtils.SetAttribute(element, "attr159", XmlUtils.ToXmlString(Attr159));
        XmlUtils.SetAttribute(element, "attr160", XmlUtils.ToXmlString(Attr160));
        XmlUtils.SetAttribute(element, "attr161", XmlUtils.ToXmlString(Attr161));
        XmlUtils.SetAttribute(element, "attr162", XmlUtils.ToXmlString(Attr162));
        XmlUtils.SetAttribute(element, "attr163", XmlUtils.ToXmlString(Attr163));
        XmlUtils.SetAttribute(element, "attr164", XmlUtils.ToXmlString(Attr164));
        XmlUtils.SetAttribute(element, "attr165", XmlUtils.ToXmlString(Attr165));
        XmlUtils.SetAttribute(element, "attr166", XmlUtils.ToXmlString(Attr166));
        XmlUtils.SetAttribute(element, "attr167", XmlUtils.ToXmlString(Attr167));
        XmlUtils.SetAttribute(element, "attr168", XmlUtils.ToXmlString(Attr168));
        XmlUtils.SetAttribute(element, "attr169", XmlUtils.ToXmlString(Attr169));
        XmlUtils.SetAttribute(element, "attr170", XmlUtils.ToXmlString(Attr170));
        XmlUtils.SetAttribute(element, "attr171", XmlUtils.ToXmlString(Attr171));
        XmlUtils.SetAttribute(element, "attr172", XmlUtils.ToXmlString(Attr172));
        XmlUtils.SetAttribute(element, "attr173", XmlUtils.ToXmlString(Attr173));
        XmlUtils.SetAttribute(element, "attr174", XmlUtils.ToXmlString(Attr174));
        XmlUtils.SetAttribute(element, "attr175", XmlUtils.ToXmlString(Attr175));
        XmlUtils.SetAttribute(element, "attr176", XmlUtils.ToXmlString(Attr176));
        XmlUtils.SetAttribute(element, "attr177", XmlUtils.ToXmlString(Attr177));
        XmlUtils.SetAttribute(element, "attr178", XmlUtils.ToXmlString(Attr178));
        XmlUtils.SetAttribute(element, "attr179", XmlUtils.ToXmlString(Attr179));
        XmlUtils.SetAttribute(element, "attr180", XmlUtils.ToXmlString(Attr180));
        XmlUtils.SetAttribute(element, "attr181", XmlUtils.ToXmlString(Attr181));
        XmlUtils.SetAttribute(element, "attr182", XmlUtils.ToXmlString(Attr182));
        XmlUtils.SetAttribute(element, "attr183", XmlUtils.ToXmlString(Attr183));
        XmlUtils.SetAttribute(element, "attr184", XmlUtils.ToXmlString(Attr184));
        XmlUtils.SetAttribute(element, "attr185", XmlUtils.ToXmlString(Attr185));
        XmlUtils.SetAttribute(element, "attr186", XmlUtils.ToXmlString(Attr186));
        XmlUtils.SetAttribute(element, "attr187", XmlUtils.ToXmlString(Attr187));
        XmlUtils.SetAttribute(element, "attr188", XmlUtils.ToXmlString(Attr188));
        XmlUtils.SetAttribute(element, "attr189", XmlUtils.ToXmlString(Attr189));
        XmlUtils.SetAttribute(element, "attr190", XmlUtils.ToXmlString(Attr190));
        XmlUtils.SetAttribute(element, "attr191", XmlUtils.ToXmlString(Attr191));
        XmlUtils.SetAttribute(element, "attr192", XmlUtils.ToXmlString(Attr192));
        XmlUtils.SetAttribute(element, "attr193", XmlUtils.ToXmlString(Attr193));
        XmlUtils.SetAttribute(element, "attr194", XmlUtils.ToXmlString(Attr194));
        XmlUtils.SetAttribute(element, "attr195", XmlUtils.ToXmlString(Attr195));
        XmlUtils.SetAttribute(element, "attr196", XmlUtils.ToXmlString(Attr196));
        XmlUtils.SetAttribute(element, "attr197", XmlUtils.ToXmlString(Attr197));
        XmlUtils.SetAttribute(element, "attr198", XmlUtils.ToXmlString(Attr198));
        XmlUtils.SetAttribute(element, "attr199", XmlUtils.ToXmlString(Attr199));
        XmlUtils.SetAttribute(element, "attr200", XmlUtils.ToXmlString(Attr200));
        XmlUtils.SetAttribute(element, "attr201", XmlUtils.ToXmlString(Attr201));
        XmlUtils.SetAttribute(element, "attr202", XmlUtils.ToXmlString(Attr202));
        XmlUtils.SetAttribute(element, "attr203", XmlUtils.ToXmlString(Attr203));
        XmlUtils.SetAttribute(element, "attr204", XmlUtils.ToXmlString(Attr204));
        XmlUtils.SetAttribute(element, "attr205", XmlUtils.ToXmlString(Attr205));
        XmlUtils.SetAttribute(element, "attr206", XmlUtils.ToXmlString(Attr206));
        XmlUtils.SetAttribute(element, "attr207", XmlUtils.ToXmlString(Attr207));
        XmlUtils.SetAttribute(element, "attr208", XmlUtils.ToXmlString(Attr208));
        XmlUtils.SetAttribute(element, "attr209", XmlUtils.ToXmlString(Attr209));
        XmlUtils.SetAttribute(element, "attr210", XmlUtils.ToXmlString(Attr210));
        XmlUtils.SetAttribute(element, "attr211", XmlUtils.ToXmlString(Attr211));
        XmlUtils.SetAttribute(element, "attr212", XmlUtils.ToXmlString(Attr212));
        XmlUtils.SetAttribute(element, "attr213", XmlUtils.ToXmlString(Attr213));
        XmlUtils.SetAttribute(element, "attr214", XmlUtils.ToXmlString(Attr214));
        XmlUtils.SetAttribute(element, "attr215", XmlUtils.ToXmlString(Attr215));
        XmlUtils.SetAttribute(element, "attr216", XmlUtils.ToXmlString(Attr216));
        XmlUtils.SetAttribute(element, "attr217", XmlUtils.ToXmlString(Attr217));
        XmlUtils.SetAttribute(element, "attr218", XmlUtils.ToXmlString(Attr218));
        XmlUtils.SetAttribute(element, "attr219", XmlUtils.ToXmlString(Attr219));
        XmlUtils.SetAttribute(element, "attr220", XmlUtils.ToXmlString(Attr220));
        XmlUtils.SetAttribute(element, "attr221", XmlUtils.ToXmlString(Attr221));
        XmlUtils.SetAttribute(element, "attr222", XmlUtils.ToXmlString(Attr222));
        XmlUtils.SetAttribute(element, "attr223", XmlUtils.ToXmlString(Attr223));
        XmlUtils.SetAttribute(element, "attr224", XmlUtils.ToXmlString(Attr224));
        XmlUtils.SetAttribute(element, "attr225", XmlUtils.ToXmlString(Attr225));
        XmlUtils.SetAttribute(element, "attr226", XmlUtils.ToXmlString(Attr226));
        XmlUtils.SetAttribute(element, "attr227", XmlUtils.ToXmlString(Attr227));
        XmlUtils.SetAttribute(element, "attr228", XmlUtils.ToXmlString(Attr228));
        XmlUtils.SetAttribute(element, "attr229", XmlUtils.ToXmlString(Attr229));
        XmlUtils.SetAttribute(element, "attr230", XmlUtils.ToXmlString(Attr230));
        XmlUtils.SetAttribute(element, "attr231", XmlUtils.ToXmlString(Attr231));
        XmlUtils.SetAttribute(element, "attr232", XmlUtils.ToXmlString(Attr232));
        XmlUtils.SetAttribute(element, "attr233", XmlUtils.ToXmlString(Attr233));
        XmlUtils.SetAttribute(element, "attr234", XmlUtils.ToXmlString(Attr234));
        XmlUtils.SetAttribute(element, "attr235", XmlUtils.ToXmlString(Attr235));
        XmlUtils.SetAttribute(element, "attr236", XmlUtils.ToXmlString(Attr236));
        XmlUtils.SetAttribute(element, "attr237", XmlUtils.ToXmlString(Attr237));
        XmlUtils.SetAttribute(element, "attr238", XmlUtils.ToXmlString(Attr238));
        XmlUtils.SetAttribute(element, "attr239", XmlUtils.ToXmlString(Attr239));
        XmlUtils.SetAttribute(element, "attr240", XmlUtils.ToXmlString(Attr240));
        XmlUtils.SetAttribute(element, "attr241", XmlUtils.ToXmlString(Attr241));
        XmlUtils.SetAttribute(element, "attr242", XmlUtils.ToXmlString(Attr242));
        XmlUtils.SetAttribute(element, "attr243", XmlUtils.ToXmlString(Attr243));
        XmlUtils.SetAttribute(element, "attr244", XmlUtils.ToXmlString(Attr244));
        XmlUtils.SetAttribute(element, "attr245", XmlUtils.ToXmlString(Attr245));
        XmlUtils.SetAttribute(element, "attr246", XmlUtils.ToXmlString(Attr246));
        XmlUtils.SetAttribute(element, "attr247", XmlUtils.ToXmlString(Attr247));
        XmlUtils.SetAttribute(element, "attr248", XmlUtils.ToXmlString(Attr248));
        XmlUtils.SetAttribute(element, "attr249", XmlUtils.ToXmlString(Attr249));
        XmlUtils.SetAttribute(element, "attr250", XmlUtils.ToXmlString(Attr250));
        XmlUtils.SetAttribute(element, "attr251", XmlUtils.ToXmlString(Attr251));
        XmlUtils.SetAttribute(element, "attr252", XmlUtils.ToXmlString(Attr252));
        XmlUtils.SetAttribute(element, "attr253", XmlUtils.ToXmlString(Attr253));
        XmlUtils.SetAttribute(element, "attr254", XmlUtils.ToXmlString(Attr254));
        XmlUtils.SetAttribute(element, "attr255", XmlUtils.ToXmlString(Attr255));
        XmlUtils.SetAttribute(element, "attr256", XmlUtils.ToXmlString(Attr256));
        if (Children != null)
        {
            foreach (var item in Children)
            {
                element.Add(item.ToXElement());
            }
        }
        XmlUtils.AddAdditional(element, AdditionalAttributes, AdditionalChildren);
        return element;
    }

    /// <summary>
    /// Serializes this value to an XML string.
    /// </summary>
    public string ToXml() => XmlUtils.Serialize(ToXElement());

    /// <summary>
    /// Adds a <c>&lt;Pause&gt;</c> child element and returns this instance for chaining.
    /// </summary>
    public Wide Pause(Pause pause)
    {
        Children = XmlUtils.Append<Pause>(Children, pause);
        return this;
    }

    /// <summary>
    /// Adds a <c>&lt;Pause&gt;</c> child element built from the given values and returns this instance for chaining.
    /// </summary>
    public Wide Pause(int? length = null)
    {
        return Pause(new global::SeedApi.Pause { Length = length });
    }

    /// <summary>
    /// Adds an arbitrary child element (for elements not covered by the typed model) and returns this instance for chaining.
    /// </summary>
    public Wide AddChild(XmlElement child)
    {
        AdditionalChildren.Add(child);
        return this;
    }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
