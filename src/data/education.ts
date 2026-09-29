export type Lesson = {
  id: string;
  label: string;
  title: string;
  intro: string;
  points: [string, string][];
  source?: string;
  children?: Lesson[];
};
export type EducationSection = { id: string; label: string; topics: Lesson[] };
const lesson = (
  id: string,
  label: string,
  title: string,
  intro: string,
  points: [string, string][],
  source?: string,
): Lesson => ({ id, label, title, intro, points, source });
const quality = "https://www.gia.edu/diamond-quality-factor";
const rings =
  "https://4cs.gia.edu/en-us/blog/tips-for-buying-an-engagement-ring/";
const care = "https://www.gia.edu/diamond-care-cleaning";
const sapphire = "https://www.gia.edu/sapphire";
export const birthstones = [
  ["January", "Garnet", "#873c45"],
  ["February", "Amethyst", "#8b6798"],
  ["March", "Aquamarine · Bloodstone", "#a6cdd2"],
  ["April", "Diamond", "#d8dbe0"],
  ["May", "Emerald", "#397564"],
  ["June", "Pearl · Alexandrite · Moonstone", "#d9c9b8"],
  ["July", "Ruby", "#b34660"],
  ["August", "Peridot · Spinel · Sardonyx", "#9caf62"],
  ["September", "Sapphire", "#52699f"],
  ["October", "Opal · Tourmaline", "#c59eaf"],
  ["November", "Topaz · Citrine", "#c89b4b"],
  ["December", "Tanzanite · Turquoise · Zircon", "#639fbc"],
];
export const educationSections: EducationSection[] = [
  {
    id: "loose-diamonds",
    label: "Loose Diamonds",
    topics: [
      {
        ...lesson(
          "4cs",
          "The 4Cs",
          "Four ways to understand a diamond.",
          "Cut, colour, clarity and carat weight describe different qualities. Explore them together, then choose the balance that speaks to you.",
          [],
          quality,
        ),
        children: [
          lesson(
            "cut",
            "Cut",
            "The art of bringing light to life.",
            "Cut describes how a diamond’s proportions and finish interact with light. Shape describes its outline: a round, oval or pear, for example.",
            [
              [
                "Look beyond the outline",
                "Brightness is reflected white light; fire is the flash of colour; scintillation is the changing sparkle as a diamond moves.",
              ],
              [
                "See it for yourself",
                "Compare your shortlist in more than one lighting environment. Notice the whole stone, rather than one bright reflection in a photograph.",
              ],
            ],
            quality,
          ),
          lesson(
            "colour",
            "Colour",
            "Discover your shade of brilliance.",
            "GIA’s D-to-Z scale describes the normal colour range, from colourless to light yellow or brown. Fancy colours are assessed differently.",
            [
              [
                "Compare in context",
                "Look at the stone beside the metal you love. Request the individual report and compare stones under the same light.",
              ],
              [
                "Make it personal",
                "Use grades to understand a difference, then decide which appearance you enjoy wearing.",
              ],
            ],
            quality,
          ),
          lesson(
            "clarity",
            "Clarity",
            "The details within.",
            "Clarity considers internal inclusions and surface blemishes. Their position and character matter, as well as how many there are.",
            [
              [
                "Reading the scale",
                "GIA clarity grades run from Flawless to Included. Grading uses 10× magnification.",
              ],
              [
                "Ask to see the stone",
                "A grade alone does not show you how a particular diamond looks to your eye. Ask to examine it closely and at a normal viewing distance.",
              ],
            ],
            "https://www.gia.edu/gia-about/4cs-clarity",
          ),
          lesson(
            "carat",
            "Carat weight",
            "Weight is only part of the story.",
            "One carat equals 0.2 grams and is divided into 100 points. A 0.50 ct diamond weighs half a carat.",
            [
              [
                "Size and weight differ",
                "Two stones of the same weight can have different outlines and face-up dimensions. Compare millimetres as well as carats.",
              ],
              [
                "Read the total carefully",
                "For a multi-stone piece, ask for both the centre-stone weight and the combined weight. Gold purity is measured in karats, a different unit.",
              ],
            ],
            "https://my.gia.edu/gia-about/4cs-carat",
          ),
        ],
      },
      lesson(
        "shapes",
        "Shapes",
        "A silhouette that feels like you.",
        "Round, oval, pear, emerald, princess, cushion, marquise and heart shapes each give a jewel a different character.",
        [
          [
            "Start with an outline",
            "Try a softly rounded shape, an elongated silhouette and a more geometric option. Compare them on your hand or against your neckline.",
          ],
          [
            "Consider the setting",
            "Ask how the setting protects pointed corners and how the shape sits alongside other jewellery.",
          ],
        ],
        rings,
      ),
      lesson(
        "anatomy",
        "Anatomy",
        "Get to know every facet.",
        "The table is the broad top facet. The crown sits above the girdle, the narrow outer edge. The pavilion extends below it toward the culet.",
        [
          [
            "A shared vocabulary",
            "These names help you understand the proportions shown on a grading report.",
          ],
          [
            "A useful illustration",
            "Our diagram shows the main parts of a faceted diamond. It is a simplified guide, not a grading or cutting specification.",
          ],
        ],
        quality,
      ),
      lesson(
        "ideal-cut",
        "Ideal Cut",
        "Look beyond a beautiful label.",
        "“Ideal” is not a single universal grade. GIA’s standard round brilliant cut scale uses Excellent, Very Good, Good, Fair and Poor.",
        [
          [
            "Check which system is used",
            "Ask what the label means, which laboratory issued the report and whether an overall cut grade applies to that stone.",
          ],
          [
            "Compare the whole diamond",
            "Review the report, proportions, polish and symmetry alongside the diamond’s appearance in person.",
          ],
        ],
        "https://myapps.gia.edu/ReportCheckPortal/resources/HTML_Pages/About-4Cs-Cut.html",
      ),
      lesson(
        "fancy-colour",
        "Fancy Colour",
        "When colour takes centre stage.",
        "Pink, blue, yellow and other fancy-colour diamonds are appreciated for their hue and colour strength. Their evaluation differs from the D-to-Z range.",
        [
          [
            "Ask about colour origin",
            "Request written disclosure of whether the colour is natural or treated, and whether the diamond is natural or laboratory-grown.",
          ],
          [
            "Choose with clarity",
            "View an individual laboratory report and the actual stone before comparing prices.",
          ],
        ],
        "https://www.gia.edu/fancy-color-diamond",
      ),
      lesson(
        "grading",
        "Grading",
        "Read the story behind the sparkle.",
        "An independent laboratory report records a stone’s identifying characteristics and grading results. It is different from a valuation or a store’s purchase policy.",
        [
          [
            "Match the report",
            "Ask the jeweller to match the report number and measurements to your chosen stone; verify the number with the issuing laboratory.",
          ],
          [
            "Keep the paperwork",
            "Keep your invoice, report and any written service terms together. Confirm which stones in a multi-stone piece have individual reports.",
          ],
        ],
        "https://www.gia.edu/report-check-landing",
      ),
      lesson(
        "choose",
        "Choose a Diamond",
        "Choose what matters to you.",
        "Begin with the occasion, your preferred style and a comfortable total budget. Build a shortlist you can compare in person.",
        [
          [
            "Your consultation checklist",
            "Ask about natural or laboratory-grown origin, treatments, grading, dimensions, setting, final price and lead time.",
          ],
          [
            "Take time to decide",
            "Save your favourites, revisit the details and ask for any aftercare or exchange terms in writing before purchase.",
          ],
        ],
        rings,
      ),
      lesson(
        "care",
        "Diamond Care",
        "Keep the brilliance close.",
        "A diamond resists scratching, but a sharp impact can still chip it. Its setting also needs care.",
        [
          [
            "A gentle routine",
            "For an untreated diamond in a suitable secure setting, mild soapy water and a soft brush can remove everyday buildup. Rinse carefully and dry with a soft cloth.",
          ],
          [
            "Know the whole piece",
            "Treatments, other gems and loose settings can change what is safe. Ask your jeweller before ultrasonic or steam cleaning, and have loose stones checked before wearing.",
          ],
        ],
        care,
      ),
    ],
  },
  {
    id: "engagement-rings",
    label: "Engagement Rings",
    topics: [
      lesson(
        "styles",
        "Ring Types",
        "A ring for your kind of forever.",
        "Start with a silhouette: a single-stone solitaire, a halo, a three-stone design or a band with smaller accents.",
        [
          [
            "Try different profiles",
            "Look at the ring from the side as well as the top. Notice its height and how it feels against neighbouring fingers.",
          ],
          [
            "Bring your everyday into it",
            "Share how often you plan to wear it and which details you love. Those conversations help shape a thoughtful shortlist.",
          ],
        ],
        rings,
      ),
      lesson(
        "settings",
        "Setting Types",
        "The detail that holds the light.",
        "Prongs hold a stone at individual points. A bezel surrounds its edge. Channel and pavé arrangements create different rhythms with smaller stones.",
        [
          [
            "Balance look and lifestyle",
            "Ask about protection, cleaning access and the maintenance of your preferred setting.",
          ],
          [
            "Consider a future band",
            "Try the engagement ring with a wedding band to see how their profiles sit together.",
          ],
        ],
        rings,
      ),
      lesson(
        "metals",
        "Metals",
        "Choose the frame for your stone.",
        "Compare yellow gold, white gold, rose gold and platinum visually. Confirm which options are available for the design you choose.",
        [
          [
            "Ask for specifics",
            "Discuss purity, alloy ingredients, surface treatments and any sensitivities you have.",
          ],
          [
            "Think beyond the first day",
            "Ask what finish maintenance and resizing are possible for the exact ring.",
          ],
        ],
        rings,
      ),
      lesson(
        "budget",
        "Budget",
        "A meaningful choice. A comfortable budget.",
        "Choose a total you feel comfortable with; there is no required salary-based rule for an engagement ring.",
        [
          [
            "Set priorities together",
            "Would you value a particular silhouette, a larger centre stone or intricate craftsmanship most? Share your priorities before building a shortlist.",
          ],
          [
            "Request the complete quote",
            "Include the stone, setting, making charges, taxes and any requested custom work. Confirm a quote’s validity before committing.",
          ],
        ],
      ),
      lesson(
        "choose",
        "Choosing a Ring",
        "Make room for a personal detail.",
        "A familiar motif, an unexpected stone shape or a quietly beautiful band can make a ring feel unmistakably yours.",
        [
          [
            "Bring inspiration",
            "Save designs you love and note what draws you to each: shape, proportion, colour or texture.",
          ],
          [
            "Check the practical details",
            "Confirm finger size, timing, engraving possibilities and written alteration terms with the team.",
          ],
        ],
      ),
      lesson(
        "manufacturing",
        "Manufacturing",
        "From an idea to something tangible.",
        "A bespoke journey can move from sketches to modelling, metalwork, setting and finishing. The exact process depends on the design.",
        [
          [
            "Begin on paper",
            "Explore the role of a measured sketch in our Traditional Drawing section.",
          ],
          [
            "Agree the milestones",
            "Ask when you will review the design, which changes remain possible and when the finished piece is expected.",
          ],
        ],
      ),
    ],
  },
  {
    id: "natural-gemstones",
    label: "Natural Gemstones",
    topics: [
      {
        ...lesson(
          "sapphires",
          "Sapphires",
          "Colour, with character.",
          "Sapphires belong to the corundum family and appear in many colours.",
          [],
          sapphire,
        ),
        children: [
          lesson(
            "blue",
            "Blue sapphires",
            "A world of blue.",
            "Blue sapphires range in tone and colour intensity. Look at the individual stone in different light to discover the colour you enjoy.",
            [
              [
                "Ask about treatments",
                "Heat treatment is common in sapphire. Request disclosure and an appropriate laboratory report for your chosen stone.",
              ],
              [
                "Imagine the pairing",
                "Compare the sapphire against different metal colours and alongside any accent stones.",
              ],
            ],
            sapphire,
          ),
          lesson(
            "yellow",
            "Yellow sapphires",
            "A little warmth, beautifully held.",
            "Yellow is one of sapphire’s many colour varieties. Tone and saturation help give each gem its particular expression.",
            [
              [
                "See the individual stone",
                "Compare photographs with the actual gem before making your choice.",
              ],
              [
                "Keep the details clear",
                "Ask about natural or laboratory-grown origin, treatments, care and any accompanying report.",
              ],
            ],
            sapphire,
          ),
          lesson(
            "pink",
            "Pink sapphires",
            "A softer expression of colour.",
            "Pink sapphires offer another expression of corundum. The boundary between pink sapphire and ruby can be described differently across markets.",
            [
              [
                "Let the stone lead",
                "Choose a shade you enjoy, rather than relying on a colour name alone.",
              ],
              [
                "Ask for documentation",
                "Confirm the stone’s identification and any treatment disclosure in writing.",
              ],
            ],
            sapphire,
          ),
        ],
      },
      lesson(
        "emeralds",
        "Green Emeralds",
        "Green, with a story within.",
        "Emeralds often contain fractures and may receive clarity-enhancing treatments. Gentle care is especially important.",
        [
          [
            "Understand the treatment",
            "Ask whether the stone has been filled or otherwise treated and how that affects care.",
          ],
          [
            "Clean with care",
            "Avoid steam and ultrasonic cleaners for emeralds. Ask for cleaning advice tailored to the whole piece.",
          ],
        ],
        "https://www.gia.edu/emerald-care-cleaning",
      ),
      lesson(
        "rubies",
        "Red Rubies",
        "A vivid point of expression.",
        "Ruby is the red variety of corundum. Colour, clarity, cut, weight and treatments all contribute to the individual gem’s character and value.",
        [
          [
            "Compare in person",
            "Look at the colour and any visible inclusions under more than one light.",
          ],
          [
            "Request clear disclosure",
            "Confirm whether the ruby is natural or laboratory-grown, its treatments and any available laboratory documentation.",
          ],
        ],
        "https://www.gia.edu/ruby",
      ),
      lesson(
        "anatomy",
        "Gemstone Anatomy",
        "A closer look at colour and form.",
        "A faceted gem has polished flat surfaces; a cabochon has a smooth rounded surface. The chosen form influences how the gem presents its colour and light.",
        [
          [
            "Look from every angle",
            "Examine the face, profile and base with the jeweller. Ask which areas need protection in the setting.",
          ],
          [
            "Care is individual",
            "Hardness alone does not tell the whole durability story. Ask about treatments, fractures and cleaning before taking a gem home.",
          ],
        ],
      ),
    ],
  },
  {
    id: "wedding-rings",
    label: "Wedding Rings",
    topics: [
      lesson(
        "styles",
        "Wedding Ring Styles",
        "A small circle. An everyday meaning.",
        "Explore plain bands, textured finishes, engraved details and stone-set designs. Your rings can complement each other without being identical.",
        [
          [
            "Try the proportions",
            "Compare narrow and wider bands, rounded and flatter profiles, and the feel of the inner edge.",
          ],
          [
            "Wear them together",
            "If pairing with an engagement ring, check both the appearance and comfort of the combination.",
          ],
        ],
      ),
      lesson(
        "metals",
        "Alternative Metals",
        "A material for your everyday.",
        "Different metals have different finishes and workshop requirements. Availability depends on the design and supplier.",
        [
          [
            "Ask before choosing",
            "Discuss alloy composition, weight, scratch behaviour and maintenance with the jeweller.",
          ],
          [
            "Consider future changes",
            "Some materials and designs are difficult to resize. Confirm the options for your chosen ring before ordering.",
          ],
        ],
      ),
      lesson(
        "choose",
        "Finding Your Ring",
        "Make the everyday feel personal.",
        "Choose a ring that feels comfortable in your daily routine, with details you will enjoy seeing for years.",
        [
          [
            "Leave time for fitting",
            "Try the intended band width and confirm size with the showroom.",
          ],
          [
            "Agree the finishing touches",
            "Review engraving, finish, delivery timing and alteration terms together.",
          ],
        ],
      ),
    ],
  },
  {
    id: "jewellery",
    label: "Jewellery",
    topics: [
      lesson(
        "studs",
        "Diamond Studs",
        "A pair of quiet statements.",
        "For diamond studs, compare the pair together: shape, visible size, colour and sparkle should feel balanced to your eye.",
        [
          [
            "Comfort comes first",
            "Try the setting height and ask the team to demonstrate the fastening.",
          ],
          [
            "Read the weight",
            "Check whether a carat figure refers to each earring or the pair combined. Ask about stone details and available documentation.",
          ],
        ],
      ),
      lesson(
        "pendants",
        "Diamond Pendants",
        "A point of light, close to you.",
        "A pendant’s character comes from both the jewel and the chain. Consider the neckline you wear most often.",
        [
          [
            "Look at the pairing",
            "Check the chain length, clasp, bail opening and how the pendant sits.",
          ],
          [
            "Ask what is included",
            "Confirm whether the quote includes the chain and request details for every part of the piece.",
          ],
        ],
      ),
      lesson(
        "pearls",
        "Pearls",
        "Beauty with a softer touch.",
        "Pearls need gentle handling. Their surface can be damaged by chemicals and abrasive materials.",
        [
          [
            "After wearing",
            "Wipe with a soft cloth and store separately from pieces that might scratch them.",
          ],
          [
            "Care for the whole strand",
            "Keep perfume and cosmetics away from the surface. Ask your jeweller to inspect the thread and clasp when needed.",
          ],
        ],
        "https://www.gia.edu/pearl-care-cleaning",
      ),
    ],
  },
  {
    id: "size-chart",
    label: "Size Chart",
    topics: [
      lesson(
        "rings",
        "Ring Size Guide",
        "A good fit is a feeling.",
        "Use a well-fitting ring as a starting point. Measure its inside diameter across the centre, excluding the metal itself.",
        [
          [
            "Bring a reference",
            "Share the diameter in millimetres and the finger you intend to wear it on. Ring-size numbering varies between systems.",
          ],
          [
            "Confirm in the showroom",
            "A professional fitting using the intended band width is the best next step. Screen images and printed circles can change scale.",
          ],
        ],
      ),
      lesson(
        "bangles",
        "Bangles & Bracelets",
        "Room to move. Confidence to wear.",
        "A rigid bangle must pass comfortably over your hand; a bracelet fastens around the wrist. They need different measurements.",
        [
          [
            "For a bangle",
            "Measure the inside diameter of a bangle you already wear comfortably, and bring it to your consultation if possible.",
          ],
          [
            "For a bracelet",
            "Measure your wrist with a flexible tape, without pulling it tight. Tell the team whether you prefer a close or relaxed fit; the final allowance depends on the design.",
          ],
        ],
      ),
    ],
  },
  {
    id: "birthstones",
    label: "Birthstones",
    topics: [
      lesson(
        "calendar",
        "Birthstone Calendar",
        "A personal month. A meaningful colour.",
        "Birthstones offer a thoughtful starting point for a gift or a personal design. Some months have more than one traditionally associated gem.",
        [
          [
            "A starting point, not a rule",
            "Choose by your month, a loved one’s birthday or simply a colour you enjoy. These associations are traditions, not promises of health or good fortune.",
          ],
          [
            "Make it wearable",
            "Discuss the stone’s care and suitability for the piece you have in mind.",
          ],
        ],
        "https://www.gia.edu/birthstones",
      ),
    ],
  },
];
export function educationHref(section: string, topic?: string, child?: string) {
  return `#/education/${[section, topic, child].filter(Boolean).join("/")}`;
}
