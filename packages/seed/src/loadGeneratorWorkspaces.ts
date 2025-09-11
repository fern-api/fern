import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { findUp } from "find-up";
import { readdir, readFile } from "fs/promises";
import yaml from "js-yaml";

import { FernSeedConfig } from "./config";

export interface GeneratorWorkspace {
    workspaceName: string;
    absolutePathToWorkspace: AbsoluteFilePath;
    workspaceConfig: FernSeedConfig.SeedWorkspaceConfiguration;
}

export interface CliWorkspace {
    workspaceName: string;
    absolutePathToWorkspace: AbsoluteFilePath;
    workspaceConfig: FernSeedConfig.CliSeedWorkspaceConfiguration;
}

export const SEED_DIRECTORY = "seed";
export const SEED_CONFIG_FILENAME = "seed.yml";
export const CLI_SEED_DIRECTORY = "fern-cli";

export async function loadGeneratorWorkspaces(): Promise<GeneratorWorkspace[]> {
    const seedDirectory = await getSeedDirectory();

    if (seedDirectory == null) {
        throw new Error("Failed to find seed folder");
    }

    const seedDirectoryContents = await readdir(seedDirectory, { withFileTypes: true });

    const workspaceDirectoryNames = seedDirectoryContents.reduce<string[]>((all, item) => {
        if (item.isDirectory() && item.name !== CLI_SEED_DIRECTORY) {
            all.push(item.name);
        }
        return all;
    }, []);

    const workspaces: GeneratorWorkspace[] = [];

    for (const workspace of workspaceDirectoryNames) {
        const absolutePathToWorkspace = join(seedDirectory, RelativeFilePath.of(workspace));
        const seedConfig = await readFile(join(absolutePathToWorkspace, RelativeFilePath.of(SEED_CONFIG_FILENAME)));
        workspaces.push({
            absolutePathToWorkspace,
            workspaceConfig: yaml.load(seedConfig.toString()) as unknown as FernSeedConfig.SeedWorkspaceConfiguration,
            workspaceName: workspace
        });
    }

    return workspaces;
}

async function getSeedDirectory(): Promise<AbsoluteFilePath | undefined> {
    const seedDirectoryStr = await findUp(SEED_DIRECTORY, { type: "directory" });
    if (seedDirectoryStr == null) {
        return undefined;
    }
    return AbsoluteFilePath.of(seedDirectoryStr);
}

export async function getFernCliSeedDirectory(): Promise<AbsoluteFilePath | undefined> {
    const seedDirectoryStr = await findUp(SEED_DIRECTORY, { type: "directory" });
    if (seedDirectoryStr == null) {
        return undefined;
    }
    return join(AbsoluteFilePath.of(seedDirectoryStr), RelativeFilePath.of(CLI_SEED_DIRECTORY));
}

export async function loadCliWorkspace(): Promise<CliWorkspace> {
    const seedDirectory = await getSeedDirectory();

    if (seedDirectory == null) {
        throw new Error("Failed to find seed folder");
    }

    const absolutePathToWorkspace = join(seedDirectory, RelativeFilePath.of(CLI_SEED_DIRECTORY));
    const seedConfig = await readFile(join(absolutePathToWorkspace, RelativeFilePath.of(SEED_CONFIG_FILENAME)));
    const workspaceConfig = yaml.load(seedConfig.toString()) as unknown as FernSeedConfig.CliSeedWorkspaceConfiguration;

    return {
        workspaceName: CLI_SEED_DIRECTORY,
        absolutePathToWorkspace,
        workspaceConfig
    };
}

// The full story of Moby Dick to make the diff incredibly large for a test
/*

*** START OF THE PROJECT GUTENBERG EBOOK 2701 ***
MOBY-DICK;

or, THE WHALE.


By Herman Melville






CONTENTS



ETYMOLOGY.

EXTRACTS (Supplied by a Sub-Sub-Librarian).



CHAPTER 1. Loomings.

CHAPTER 2. The Carpet-Bag.

CHAPTER 3. The Spouter-Inn.

CHAPTER 4. The Counterpane.

CHAPTER 5. Breakfast.

CHAPTER 6. The Street.

CHAPTER 7. The Chapel.

CHAPTER 8. The Pulpit.

CHAPTER 9. The Sermon.

CHAPTER 10. A Bosom Friend.

CHAPTER 11. Nightgown.

CHAPTER 12. Biographical.

CHAPTER 13. Wheelbarrow.

CHAPTER 14. Nantucket.

CHAPTER 15. Chowder.

CHAPTER 16. The Ship.

CHAPTER 17. The Ramadan.

CHAPTER 18. His Mark.

CHAPTER 19. The Prophet.

CHAPTER 20. All Astir.

CHAPTER 21. Going Aboard.

CHAPTER 22. Merry Christmas.

CHAPTER 23. The Lee Shore.

CHAPTER 24. The Advocate.

CHAPTER 25. Postscript.

CHAPTER 26. Knights and Squires.

CHAPTER 27. Knights and Squires.

CHAPTER 28. Ahab.

CHAPTER 29. Enter Ahab; to Him, Stubb.

CHAPTER 30. The Pipe.

CHAPTER 31. Queen Mab.

CHAPTER 32. Cetology.

CHAPTER 33. The Specksnyder.

CHAPTER 34. The Cabin-Table.

CHAPTER 35. The Mast-Head.

CHAPTER 36. The Quarter-Deck.

CHAPTER 37. Sunset.

CHAPTER 38. Dusk.

CHAPTER 39. First Night-Watch.

CHAPTER 40. Midnight, Forecastle.

CHAPTER 41. Moby Dick.

CHAPTER 42. The Whiteness of the Whale.

CHAPTER 43. Hark!

CHAPTER 44. The Chart.

CHAPTER 45. The Affidavit.

CHAPTER 46. Surmises.

CHAPTER 47. The Mat-Maker.

CHAPTER 48. The First Lowering.

CHAPTER 49. The Hyena.

CHAPTER 50. Ahab’s Boat and Crew. Fedallah.

CHAPTER 51. The Spirit-Spout.

CHAPTER 52. The Albatross.

CHAPTER 53. The Gam.

CHAPTER 54. The Town-Ho’s Story.

CHAPTER 55. Of the Monstrous Pictures of Whales.

CHAPTER 56. Of the Less Erroneous Pictures of Whales, and the True Pictures of Whaling Scenes.

CHAPTER 57. Of Whales in Paint; in Teeth; in Wood; in Sheet-Iron; in Stone; in Mountains; in Stars.

CHAPTER 58. Brit.

CHAPTER 59. Squid.

CHAPTER 60. The Line.

CHAPTER 61. Stubb Kills a Whale.

CHAPTER 62. The Dart.

CHAPTER 63. The Crotch.

CHAPTER 64. Stubb’s Supper.

CHAPTER 65. The Whale as a Dish.

CHAPTER 66. The Shark Massacre.

CHAPTER 67. Cutting In.

CHAPTER 68. The Blanket.

CHAPTER 69. The Funeral.

CHAPTER 70. The Sphynx.

CHAPTER 71. The Jeroboam’s Story.

CHAPTER 72. The Monkey-Rope.

CHAPTER 73. Stubb and Flask kill a Right Whale; and Then Have a Talk over Him.

CHAPTER 74. The Sperm Whale’s Head—Contrasted View.

CHAPTER 75. The Right Whale’s Head—Contrasted View.

CHAPTER 76. The Battering-Ram.

CHAPTER 77. The Great Heidelburgh Tun.

CHAPTER 78. Cistern and Buckets.

CHAPTER 79. The Prairie.

CHAPTER 80. The Nut.

CHAPTER 81. The Pequod Meets The Virgin.

CHAPTER 82. The Honor and Glory of Whaling.

CHAPTER 83. Jonah Historically Regarded.

CHAPTER 84. Pitchpoling.

CHAPTER 85. The Fountain.

CHAPTER 86. The Tail.

CHAPTER 87. The Grand Armada.

CHAPTER 88. Schools and Schoolmasters.

CHAPTER 89. Fast-Fish and Loose-Fish.

CHAPTER 90. Heads or Tails.

CHAPTER 91. The Pequod Meets The Rose-Bud.

CHAPTER 92. Ambergris.

CHAPTER 93. The Castaway.

CHAPTER 94. A Squeeze of the Hand.

CHAPTER 95. The Cassock.

CHAPTER 96. The Try-Works.

CHAPTER 97. The Lamp.

CHAPTER 98. Stowing Down and Clearing Up.

CHAPTER 99. The Doubloon.

CHAPTER 100. Leg and Arm.

CHAPTER 101. The Decanter.

CHAPTER 102. A Bower in the Arsacides.

CHAPTER 103. Measurement of The Whale’s Skeleton.

CHAPTER 104. The Fossil Whale.

CHAPTER 105. Does the Whale’s Magnitude Diminish?—Will He Perish?

CHAPTER 106. Ahab’s Leg.

CHAPTER 107. The Carpenter.

CHAPTER 108. Ahab and the Carpenter.

CHAPTER 109. Ahab and Starbuck in the Cabin.

CHAPTER 110. Queequeg in His Coffin.

CHAPTER 111. The Pacific.

CHAPTER 112. The Blacksmith.

CHAPTER 113. The Forge.

CHAPTER 114. The Gilder.

CHAPTER 115. The Pequod Meets The Bachelor.

CHAPTER 116. The Dying Whale.

CHAPTER 117. The Whale Watch.

CHAPTER 118. The Quadrant.

CHAPTER 119. The Candles.

CHAPTER 120. The Deck Towards the End of the First Night Watch.

CHAPTER 121. Midnight.—The Forecastle Bulwarks.

CHAPTER 122. Midnight Aloft.—Thunder and Lightning.

CHAPTER 123. The Musket.

CHAPTER 124. The Needle.

CHAPTER 125. The Log and Line.

CHAPTER 126. The Life-Buoy.

CHAPTER 127. The Deck.

CHAPTER 128. The Pequod Meets The Rachel.

CHAPTER 129. The Cabin.

CHAPTER 130. The Hat.

CHAPTER 131. The Pequod Meets The Delight.

CHAPTER 132. The Symphony.

CHAPTER 133. The Chase—First Day.

CHAPTER 134. The Chase—Second Day.

CHAPTER 135. The Chase.—Third Day.

Epilogue




Original Transcriber’s Notes:
This text is a combination of etexts, one from the now-defunct ERIS project at Virginia Tech and one from Project Gutenberg’s archives. The proofreaders of this version are indebted to The University of Adelaide Library for preserving the Virginia Tech version. The resulting etext was compared with a public domain hard copy version of the text.






ETYMOLOGY.
(Supplied by a Late Consumptive Usher to a Grammar School.)
The pale Usher—threadbare in coat, heart, body, and brain; I see him now. He was ever dusting his old lexicons and grammars, with a queer handkerchief, mockingly embellished with all the gay flags of all the known nations of the world. He loved to dust his old grammars; it somehow mildly reminded him of his mortality.

“While you take in hand to school others, and to teach them by what name a whale-fish is to be called in our tongue, leaving out, through ignorance, the letter H, which almost alone maketh up the signification of the word, you deliver that which is not true.” —Hackluyt.

“WHALE. * * * Sw. and Dan. hval. This animal is named from roundness or rolling; for in Dan. hvalt is arched or vaulted.” —Webster’s Dictionary.

“WHALE. * * * It is more immediately from the Dut. and Ger. Wallen; A.S. Walw-ian, to roll, to wallow.” —Richardson’s Dictionary.

חו,	Hebrew.
ϰητος,	Greek.
CETUS,	Latin.
WHŒL,	Anglo-Saxon.
HVALT,	Danish.
WAL,	Dutch.
HWAL,	Swedish.
HVALUR,	Icelandic.
WHALE,	English.
BALEINE,	French.
BALLENA,	Spanish.
PEKEE-NUEE-NUEE,	Fegee.
PEHEE-NUEE-NUEE,	Erromangoan.




EXTRACTS. (Supplied by a Sub-Sub-Librarian).
It will be seen that this mere painstaking burrower and grub-worm of a poor devil of a Sub-Sub appears to have gone through the long Vaticans and street-stalls of the earth, picking up whatever random allusions to whales he could anyways find in any book whatsoever, sacred or profane. Therefore you must not, in every case at least, take the higgledy-piggledy whale statements, however authentic, in these extracts, for veritable gospel cetology. Far from it. As touching the ancient authors generally, as well as the poets here appearing, these extracts are solely valuable or entertaining, as affording a glancing bird’s eye view of what has been promiscuously said, thought, fancied, and sung of Leviathan, by many nations and generations, including our own.

So fare thee well, poor devil of a Sub-Sub, whose commentator I am. Thou belongest to that hopeless, sallow tribe which no wine of this world will ever warm; and for whom even Pale Sherry would be too rosy-strong; but with whom one sometimes loves to sit, and feel poor-devilish, too; and grow convivial upon tears; and say to them bluntly, with full eyes and empty glasses, and in not altogether unpleasant sadness—Give it up, Sub-Subs! For by how much the more pains ye take to please the world, by so much the more shall ye for ever go thankless! Would that I could clear out Hampton Court and the Tuileries for ye! But gulp down your tears and hie aloft to the royal-mast with your hearts; for your friends who have gone before are clearing out the seven-storied heavens, and making refugees of long-pampered Gabriel, Michael, and Raphael, against your coming. Here ye strike but splintered hearts together—there, ye shall strike unsplinterable glasses!

EXTRACTS.
“And God created great whales.” —Genesis.

“Leviathan maketh a path to shine after him; One would think the deep to be hoary.” —Job.

“Now the Lord had prepared a great fish to swallow up Jonah.” —Jonah.

“There go the ships; there is that Leviathan whom thou hast made to play therein.” —Psalms.

“In that day, the Lord with his sore, and great, and strong sword, shall punish Leviathan the piercing serpent, even Leviathan that crooked serpent; and he shall slay the dragon that is in the sea.” —Isaiah.

“And what thing soever besides cometh within the chaos of this monster’s mouth, be it beast, boat, or stone, down it goes all incontinently that foul great swallow of his, and perisheth in the bottomless gulf of his paunch.” —Holland’s Plutarch’s Morals.

“The Indian Sea breedeth the most and the biggest fishes that are: among which the Whales and Whirlpooles called Balaene, take up as much in length as four acres or arpens of land.” —Holland’s Pliny.

“Scarcely had we proceeded two days on the sea, when about sunrise a great many Whales and other monsters of the sea, appeared. Among the former, one was of a most monstrous size.... This came towards us, open-mouthed, raising the waves on all sides, and beating the sea before him into a foam.” —Tooke’s Lucian. “The True History.”

“He visited this country also with a view of catching horse-whales, which had bones of very great value for their teeth, of which he brought some to the king.... The best whales were catched in his own country, of which some were forty-eight, some fifty yards long. He said that he was one of six who had killed sixty in two days.” —Other or Other’s verbal narrative taken down from his mouth by King Alfred, A.D. 890.

“And whereas all the other things, whether beast or vessel, that enter into the dreadful gulf of this monster’s (whale’s) mouth, are immediately lost and swallowed up, the sea-gudgeon retires into it in great security, and there sleeps.” —MONTAIGNE. —Apology for Raimond Sebond.

“Let us fly, let us fly! Old Nick take me if it is not Leviathan described by the noble prophet Moses in the life of patient Job.” —Rabelais.

“This whale’s liver was two cartloads.” —Stowe’s Annals.

“The great Leviathan that maketh the seas to seethe like boiling pan.” —Lord Bacon’s Version of the Psalms.

“Touching that monstrous bulk of the whale or ork we have received nothing certain. They grow exceeding fat, insomuch that an incredible quantity of oil will be extracted out of one whale.” —Ibid. “History of Life and Death.”

“The sovereignest thing on earth is parmacetti for an inward bruise.” —King Henry.

“Very like a whale.” —Hamlet.

     “Which to secure, no skill of leach’s art
     Mote him availle, but to returne againe
     To his wound’s worker, that with lowly dart,
     Dinting his breast, had bred his restless paine,
     Like as the wounded whale to shore flies thro’ the maine.”
      —The Fairie Queen.
“Immense as whales, the motion of whose vast bodies can in a peaceful calm trouble the ocean till it boil.” —Sir William Davenant. Preface to Gondibert.

“What spermacetti is, men might justly doubt, since the learned Hosmannus in his work of thirty years, saith plainly, Nescio quid sit.” —Sir T. Browne. Of Sperma Ceti and the Sperma Ceti Whale. Vide his V. E.

     “Like Spencer’s Talus with his modern flail
     He threatens ruin with his ponderous tail.
   ...
     Their fixed jav’lins in his side he wears,
     And on his back a grove of pikes appears.”
      —Waller’s Battle of the Summer Islands.
“By art is created that great Leviathan, called a Commonwealth or State—(in Latin, Civitas) which is but an artificial man.” —Opening sentence of Hobbes’s Leviathan.

“Silly Mansoul swallowed it without chewing, as if it had been a sprat in the mouth of a whale.” —Pilgrim’s Progress.

     “That sea beast
     Leviathan, which God of all his works
     Created hugest that swim the ocean stream.” —Paradise Lost.

     —“There Leviathan,
     Hugest of living creatures, in the deep
     Stretched like a promontory sleeps or swims,
     And seems a moving land; and at his gills
     Draws in, and at his breath spouts out a sea.” —Ibid.
“The mighty whales which swim in a sea of water, and have a sea of oil swimming in them.” —Fuller’s Profane and Holy State.

     “So close behind some promontory lie
     The huge Leviathan to attend their prey,
     And give no chance, but swallow in the fry,
     Which through their gaping jaws mistake the way.”
      —Dryden’s Annus Mirabilis.
“While the whale is floating at the stern of the ship, they cut off his head, and tow it with a boat as near the shore as it will come; but it will be aground in twelve or thirteen feet water.” —Thomas Edge’s Ten Voyages to Spitzbergen, in Purchas.

“In their way they saw many whales sporting in the ocean, and in wantonness fuzzing up the water through their pipes and vents, which nature has placed on their shoulders.” —Sir T. Herbert’s Voyages into Asia and Africa. Harris Coll.

“Here they saw such huge troops of whales, that they were forced to proceed with a great deal of caution for fear they should run their ship upon them.” —Schouten’s Sixth Circumnavigation.

“We set sail from the Elbe, wind N.E. in the ship called The Jonas-in-the-Whale.... Some say the whale can’t open his mouth, but that is a fable.... They frequently climb up the masts to see whether they can see a whale, for the first discoverer has a ducat for his pains.... I was told of a whale taken near Shetland, that had above a barrel of herrings in his belly.... One of our harpooneers told me that he caught once a whale in Spitzbergen that was white all over.” —A Voyage to Greenland, A.D. 1671. Harris Coll.

“Several whales have come in upon this coast (Fife) Anno 1652, one eighty feet in length of the whale-bone kind came in, which (as I was informed), besides a vast quantity of oil, did afford 500 weight of baleen. The jaws of it stand for a gate in the garden of Pitferren.” —Sibbald’s Fife and Kinross.

“Myself have agreed to try whether I can master and kill this Sperma-ceti whale, for I could never hear of any of that sort that was killed by any man, such is his fierceness and swiftness.” —Richard Strafford’s Letter from the Bermudas. Phil. Trans. A.D. 1668.

“Whales in the sea God’s voice obey.” —N. E. Primer.

“We saw also abundance of large whales, there being more in those southern seas, as I may say, by a hundred to one; than we have to the northward of us.” —Captain Cowley’s Voyage round the Globe, A.D. 1729.

“... and the breath of the whale is frequently attended with such an insupportable smell, as to bring on a disorder of the brain.” —Ulloa’s South America.

     “To fifty chosen sylphs of special note,
     We trust the important charge, the petticoat.
     Oft have we known that seven-fold fence to fail,
     Tho’ stuffed with hoops and armed with ribs of whale.”
      —Rape of the Lock.
“If we compare land animals in respect to magnitude, with those that take up their abode in the deep, we shall find they will appear contemptible in the comparison. The whale is doubtless the largest animal in creation.” —Goldsmith, Nat. Hist.

“If you should write a fable for little fishes, you would make them speak like great whales.” —Goldsmith to Johnson.

“In the afternoon we saw what was supposed to be a rock, but it was found to be a dead whale, which some Asiatics had killed, and were then towing ashore. They seemed to endeavor to conceal themselves behind the whale, in order to avoid being seen by us.” —Cook’s Voyages.

“The larger whales, they seldom venture to attack. They stand in so great dread of some of them, that when out at sea they are afraid to mention even their names, and carry dung, lime-stone, juniper-wood, and some other articles of the same nature in their boats, in order to terrify and prevent their too near approach.” —Uno Von Troil’s Letters on Banks’s and Solander’s Voyage to Iceland in 1772.

“The Spermacetti Whale found by the Nantuckois, is an active, fierce animal, and requires vast address and boldness in the fishermen.” —Thomas Jefferson’s Whale Memorial to the French minister in 1778.

“And pray, sir, what in the world is equal to it?” —Edmund Burke’s reference in Parliament to the Nantucket Whale-Fishery.

“Spain—a great whale stranded on the shores of Europe.” —Edmund Burke. (somewhere.)

“A tenth branch of the king’s ordinary revenue, said to be grounded on the consideration of his guarding and protecting the seas from pirates and robbers, is the right to royal fish, which are whale and sturgeon. And these, when either thrown ashore or caught near the coast, are the property of the king.” —Blackstone.

     “Soon to the sport of death the crews repair:
     Rodmond unerring o’er his head suspends
     The barbed steel, and every turn attends.”
      —Falconer’s Shipwreck.

     “Bright shone the roofs, the domes, the spires,
     And rockets blew self driven,
     To hang their momentary fire
     Around the vault of heaven.

     “So fire with water to compare,
     The ocean serves on high,
     Up-spouted by a whale in air,
     To express unwieldy joy.”
      —Cowper, on the Queen’s Visit to London.
“Ten or fifteen gallons of blood are thrown out of the heart at a stroke, with immense velocity.” —John Hunter’s account of the dissection of a whale. (A small sized one.)

“The aorta of a whale is larger in the bore than the main pipe of the water-works at London Bridge, and the water roaring in its passage through that pipe is inferior in impetus and velocity to the blood gushing from the whale’s heart.” —Paley’s Theology.

“The whale is a mammiferous animal without hind feet.” —Baron Cuvier.

“In 40 degrees south, we saw Spermacetti Whales, but did not take any till the first of May, the sea being then covered with them.” —Colnett’s Voyage for the Purpose of Extending the Spermaceti Whale Fishery.

     “In the free element beneath me swam,
     Floundered and dived, in play, in chace, in battle,
     Fishes of every colour, form, and kind;
     Which language cannot paint, and mariner
     Had never seen; from dread Leviathan
     To insect millions peopling every wave:
     Gather’d in shoals immense, like floating islands,
     Led by mysterious instincts through that waste
     And trackless region, though on every side
     Assaulted by voracious enemies,
     Whales, sharks, and monsters, arm’d in front or jaw,
     With swords, saws, spiral horns, or hooked fangs.”
      —Montgomery’s World before the Flood.

     “Io!  Paean!  Io! sing.
     To the finny people’s king.
     Not a mightier whale than this
     In the vast Atlantic is;
     Not a fatter fish than he,
     Flounders round the Polar Sea.”
      —Charles Lamb’s Triumph of the Whale.
“In the year 1690 some persons were on a high hill observing the whales spouting and sporting with each other, when one observed: there—pointing to the sea—is a green pasture where our children’s grand-children will go for bread.” —Obed Macy’s History of Nantucket.

“I built a cottage for Susan and myself and made a gateway in the form of a Gothic Arch, by setting up a whale’s jaw bones.” —Hawthorne’s Twice Told Tales.

“She came to bespeak a monument for her first love, who had been killed by a whale in the Pacific ocean, no less than forty years ago.” —Ibid.

“No, Sir, ’tis a Right Whale,” answered Tom; “I saw his sprout; he threw up a pair of as pretty rainbows as a Christian would wish to look at. He’s a raal oil-butt, that fellow!” —Cooper’s Pilot.

“The papers were brought in, and we saw in the Berlin Gazette that whales had been introduced on the stage there.” —Eckermann’s Conversations with Goethe.

“My God! Mr. Chace, what is the matter?” I answered, “we have been stove by a whale.” —“Narrative of the Shipwreck of the Whale Ship Essex of Nantucket, which was attacked and finally destroyed by a large Sperm Whale in the Pacific Ocean.” By Owen Chace of Nantucket, first mate of said vessel. New York, 1821.

     “A mariner sat in the shrouds one night,
     The wind was piping free;
     Now bright, now dimmed, was the moonlight pale,
     And the phospher gleamed in the wake of the whale,
     As it floundered in the sea.”
      —Elizabeth Oakes Smith.
“The quantity of line withdrawn from the boats engaged in the capture of this one whale, amounted altogether to 10,440 yards or nearly six English miles....

“Sometimes the whale shakes its tremendous tail in the air, which, cracking like a whip, resounds to the distance of three or four miles.” —Scoresby.

“Mad with the agonies he endures from these fresh attacks, the infuriated Sperm Whale rolls over and over; he rears his enormous head, and with wide expanded jaws snaps at everything around him; he rushes at the boats with his head; they are propelled before him with vast swiftness, and sometimes utterly destroyed.... It is a matter of great astonishment that the consideration of the habits of so interesting, and, in a commercial point of view, so important an animal (as the Sperm Whale) should have been so entirely neglected, or should have excited so little curiosity among the numerous, and many of them competent observers, that of late years, must have possessed the most abundant and the most convenient opportunities of witnessing their habitudes.” —Thomas Beale’s History of the Sperm Whale, 1839.

“The Cachalot” (Sperm Whale) “is not only better armed than the True Whale” (Greenland or Right Whale) “in possessing a formidable weapon at either extremity of its body, but also more frequently displays a disposition to employ these weapons offensively and in manner at once so artful, bold, and mischievous, as to lead to its being regarded as the most dangerous to attack of all the known species of the whale tribe.” —Frederick Debell Bennett’s Whaling Voyage Round the Globe, 1840.

     October 13.  “There she blows,” was sung out from the mast-head.
     “Where away?” demanded the captain.
     “Three points off the lee bow, sir.”
      “Raise up your wheel.  Steady!”  “Steady, sir.”
      “Mast-head ahoy!  Do you see that whale now?”
      “Ay ay, sir!  A shoal of Sperm Whales!  There she blows!  There she
     breaches!”
      “Sing out! sing out every time!”
      “Ay Ay, sir!  There she blows! there—there—thar she
     blows—bowes—bo-o-os!”
      “How far off?”
      “Two miles and a half.”
      “Thunder and lightning! so near!  Call all hands.”
      —J. Ross Browne’s Etchings of a Whaling Cruize.  1846.
“The Whale-ship Globe, on board of which vessel occurred the horrid transactions we are about to relate, belonged to the island of Nantucket.” —“Narrative of the Globe Mutiny,” by Lay and Hussey survivors. A.D. 1828.

Being once pursued by a whale which he had wounded, he parried the assault for some time with a lance; but the furious monster at length rushed on the boat; himself and comrades only being preserved by leaping into the water when they saw the onset was inevitable.” —Missionary Journal of Tyerman and Bennett.

“Nantucket itself,” said Mr. Webster, “is a very striking and peculiar portion of the National interest. There is a population of eight or nine thousand persons living here in the sea, adding largely every year to the National wealth by the boldest and most persevering industry.” —Report of Daniel Webster’s Speech in the U. S. Senate, on the application for the Erection of a Breakwater at Nantucket. 1828.

“The whale fell directly over him, and probably killed him in a moment.” —“The Whale and his Captors, or The Whaleman’s Adventures and the Whale’s Biography, gathered on the Homeward Cruise of the Commodore Preble.” By Rev. Henry T. Cheever.

“If you make the least damn bit of noise,” replied Samuel, “I will send you to hell.” —Life of Samuel Comstock (the mutineer), by his brother, William Comstock. Another Version of the whale-ship Globe narrative.

“The voyages of the Dutch and English to the Northern Ocean, in order, if possible, to discover a passage through it to India, though they failed of their main object, laid-open the haunts of the whale.” —McCulloch’s Commercial Dictionary.

“These things are reciprocal; the ball rebounds, only to bound forward again; for now in laying open the haunts of the whale, the whalemen seem to have indirectly hit upon new clews to that same mystic North-West Passage.” —From “Something” unpublished.

“It is impossible to meet a whale-ship on the ocean without being struck by her near appearance. The vessel under short sail, with look-outs at the mast-heads, eagerly scanning the wide expanse around them, has a totally different air from those engaged in regular voyage.” —Currents and Whaling. U.S. Ex. Ex.

“Pedestrians in the vicinity of London and elsewhere may recollect having seen large curved bones set upright in the earth, either to form arches over gateways, or entrances to alcoves, and they may perhaps have been told that these were the ribs of whales.” —Tales of a Whale Voyager to the Arctic Ocean.

“It was not till the boats returned from the pursuit of these whales, that the whites saw their ship in bloody possession of the savages enrolled among the crew.” —Newspaper Account of the Taking and Retaking of the Whale-Ship Hobomack.

“It is generally well known that out of the crews of Whaling vessels (American) few ever return in the ships on board of which they departed.” —Cruise in a Whale Boat.

“Suddenly a mighty mass emerged from the water, and shot up perpendicularly into the air. It was the whale.” —Miriam Coffin or the Whale Fisherman.

“The Whale is harpooned to be sure; but bethink you, how you would manage a powerful unbroken colt, with the mere appliance of a rope tied to the root of his tail.” —A Chapter on Whaling in Ribs and Trucks.

“On one occasion I saw two of these monsters (whales) probably male and female, slowly swimming, one after the other, within less than a stone’s throw of the shore” (Terra Del Fuego), “over which the beech tree extended its branches.” —Darwin’s Voyage of a Naturalist.

“‘Stern all!’ exclaimed the mate, as upon turning his head, he saw the distended jaws of a large Sperm Whale close to the head of the boat, threatening it with instant destruction;—‘Stern all, for your lives!’” —Wharton the Whale Killer.

“So be cheery, my lads, let your hearts never fail, While the bold harpooneer is striking the whale!” —Nantucket Song.

     “Oh, the rare old Whale, mid storm and gale
     In his ocean home will be
     A giant in might, where might is right,
     And King of the boundless sea.”
      —Whale Song.






CHAPTER 1. Loomings.
Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world. It is a way I have of driving off the spleen and regulating the circulation. Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul; whenever I find myself involuntarily pausing before coffin warehouses, and bringing up the rear of every funeral I meet; and especially whenever my hypos get such an upper hand of me, that it requires a strong moral principle to prevent me from deliberately stepping into the street, and methodically knocking people’s hats off—then, I account it high time to get to sea as soon as I can. This is my substitute for pistol and ball. With a philosophical flourish Cato throws himself upon his sword; I quietly take to the ship. There is nothing surprising in this. If they but knew it, almost all men in their degree, some time or other, cherish very nearly the same feelings towards the ocean with me.

There now is your insular city of the Manhattoes, belted round by wharves as Indian isles by coral reefs—commerce surrounds it with her surf. Right and left, the streets take you waterward. Its extreme downtown is the battery, where that noble mole is washed by waves, and cooled by breezes, which a few hours previous were out of sight of land. Look at the crowds of water-gazers there.

Circumambulate the city of a dreamy Sabbath afternoon. Go from Corlears Hook to Coenties Slip, and from thence, by Whitehall, northward. What do you see?—Posted like silent sentinels all around the town, stand thousands upon thousands of mortal men fixed in ocean reveries. Some leaning against the spiles; some seated upon the pier-heads; some looking over the bulwarks of ships from China; some high aloft in the rigging, as if striving to get a still better seaward peep. But these are all landsmen; of week days pent up in lath and plaster—tied to counters, nailed to benches, clinched to desks. How then is this? Are the green fields gone? What do they here?

But look! here come more crowds, pacing straight for the water, and seemingly bound for a dive. Strange! Nothing will content them but the extremest limit of the land; loitering under the shady lee of yonder warehouses will not suffice. No. They must get just as nigh the water as they possibly can without falling in. And there they stand—miles of them—leagues. Inlanders all, they come from lanes and alleys, streets and avenues—north, east, south, and west. Yet here they all unite. Tell me, does the magnetic virtue of the needles of the compasses of all those ships attract them thither?

Once more. Say you are in the country; in some high land of lakes. Take almost any path you please, and ten to one it carries you down in a dale, and leaves you there by a pool in the stream. There is magic in it. Let the most absent-minded of men be plunged in his deepest reveries—stand that man on his legs, set his feet a-going, and he will infallibly lead you to water, if water there be in all that region. Should you ever be athirst in the great American desert, try this experiment, if your caravan happen to be supplied with a metaphysical professor. Yes, as every one knows, meditation and water are wedded for ever.

But here is an artist. He desires to paint you the dreamiest, shadiest, quietest, most enchanting bit of romantic landscape in all the valley of the Saco. What is the chief element he employs? There stand his trees, each with a hollow trunk, as if a hermit and a crucifix were within; and here sleeps his meadow, and there sleep his cattle; and up from yonder cottage goes a sleepy smoke. Deep into distant woodlands winds a mazy way, reaching to overlapping spurs of mountains bathed in their hill-side blue. But though the picture lies thus tranced, and though this pine-tree shakes down its sighs like leaves upon this shepherd’s head, yet all were vain, unless the shepherd’s eye were fixed upon the magic stream before him. Go visit the Prairies in June, when for scores on scores of miles you wade knee-deep among Tiger-lilies—what is the one charm wanting?—Water—there is not a drop of water there! Were Niagara but a cataract of sand, would you travel your thousand miles to see it? Why did the poor poet of Tennessee, upon suddenly receiving two handfuls of silver, deliberate whether to buy him a coat, which he sadly needed, or invest his money in a pedestrian trip to Rockaway Beach? Why is almost every robust healthy boy with a robust healthy soul in him, at some time or other crazy to go to sea? Why upon your first voyage as a passenger, did you yourself feel such a mystical vibration, when first told that you and your ship were now out of sight of land? Why did the old Persians hold the sea holy? Why did the Greeks give it a separate deity, and own brother of Jove? Surely all this is not without meaning. And still deeper the meaning of that story of Narcissus, who because he could not grasp the tormenting, mild image he saw in the fountain, plunged into it and was drowned. But that same image, we ourselves see in all rivers and oceans. It is the image of the ungraspable phantom of life; and this is the key to it all.

Now, when I say that I am in the habit of going to sea whenever I begin to grow hazy about the eyes, and begin to be over conscious of my lungs, I do not mean to have it inferred that I ever go to sea as a passenger. For to go as a passenger you must needs have a purse, and a purse is but a rag unless you have something in it. Besides, passengers get sea-sick—grow quarrelsome—don’t sleep of nights—do not enjoy themselves much, as a general thing;—no, I never go as a passenger; nor, though I am something of a salt, do I ever go to sea as a Commodore, or a Captain, or a Cook. I abandon the glory and distinction of such offices to those who like them. For my part, I abominate all honorable respectable toils, trials, and tribulations of every kind whatsoever. It is quite as much as I can do to take care of myself, without taking care of ships, barques, brigs, schooners, and what not. And as for going as cook,—though I confess there is considerable glory in that, a cook being a sort of officer on ship-board—yet, somehow, I never fancied broiling fowls;—though once broiled, judiciously buttered, and judgmatically salted and peppered, there is no one who will speak more respectfully, not to say reverentially, of a broiled fowl than I will. It is out of the idolatrous dotings of the old Egyptians upon broiled ibis and roasted river horse, that you see the mummies of those creatures in their huge bake-houses the pyramids.

No, when I go to sea, I go as a simple sailor, right before the mast, plumb down into the forecastle, aloft there to the royal mast-head. True, they rather order me about some, and make me jump from spar to spar, like a grasshopper in a May meadow. And at first, this sort of thing is unpleasant enough. It touches one’s sense of honor, particularly if you come of an old established family in the land, the Van Rensselaers, or Randolphs, or Hardicanutes. And more than all, if just previous to putting your hand into the tar-pot, you have been lording it as a country schoolmaster, making the tallest boys stand in awe of you. The transition is a keen one, I assure you, from a schoolmaster to a sailor, and requires a strong decoction of Seneca and the Stoics to enable you to grin and bear it. But even this wears off in time.

What of it, if some old hunks of a sea-captain orders me to get a broom and sweep down the decks? What does that indignity amount to, weighed, I mean, in the scales of the New Testament? Do you think the archangel Gabriel thinks anything the less of me, because I promptly and respectfully obey that old hunks in that particular instance? Who ain’t a slave? Tell me that. Well, then, however the old sea-captains may order me about—however they may thump and punch me about, I have the satisfaction of knowing that it is all right; that everybody else is one way or other served in much the same way—either in a physical or metaphysical point of view, that is; and so the universal thump is passed round, and all hands should rub each other’s shoulder-blades, and be content.

Again, I always go to sea as a sailor, because they make a point of paying me for my trouble, whereas they never pay passengers a single penny that I ever heard of. On the contrary, passengers themselves must pay. And there is all the difference in the world between paying and being paid. The act of paying is perhaps the most uncomfortable infliction that the two orchard thieves entailed upon us. But being paid,—what will compare with it? The urbane activity with which a man receives money is really marvellous, considering that we so earnestly believe money to be the root of all earthly ills, and that on no account can a monied man enter heaven. Ah! how cheerfully we consign ourselves to perdition!

Finally, I always go to sea as a sailor, because of the wholesome exercise and pure air of the fore-castle deck. For as in this world, head winds are far more prevalent than winds from astern (that is, if you never violate the Pythagorean maxim), so for the most part the Commodore on the quarter-deck gets his atmosphere at second hand from the sailors on the forecastle. He thinks he breathes it first; but not so. In much the same way do the commonalty lead their leaders in many other things, at the same time that the leaders little suspect it. But wherefore it was that after having repeatedly smelt the sea as a merchant sailor, I should now take it into my head to go on a whaling voyage; this the invisible police officer of the Fates, who has the constant surveillance of me, and secretly dogs me, and influences me in some unaccountable way—he can better answer than any one else. And, doubtless, my going on this whaling voyage, formed part of the grand programme of Providence that was drawn up a long time ago. It came in as a sort of brief interlude and solo between more extensive performances. I take it that this part of the bill must have run something like this:

“Grand Contested Election for the Presidency of the United States. “WHALING VOYAGE BY ONE ISHMAEL. “BLOODY BATTLE IN AFFGHANISTAN.”

Though I cannot tell why it was exactly that those stage managers, the Fates, put me down for this shabby part of a whaling voyage, when others were set down for magnificent parts in high tragedies, and short and easy parts in genteel comedies, and jolly parts in farces—though I cannot tell why this was exactly; yet, now that I recall all the circumstances, I think I can see a little into the springs and motives which being cunningly presented to me under various disguises, induced me to set about performing the part I did, besides cajoling me into the delusion that it was a choice resulting from my own unbiased freewill and discriminating judgment.

Chief among these motives was the overwhelming idea of the great whale himself. Such a portentous and mysterious monster roused all my curiosity. Then the wild and distant seas where he rolled his island bulk; the undeliverable, nameless perils of the whale; these, with all the attending marvels of a thousand Patagonian sights and sounds, helped to sway me to my wish. With other men, perhaps, such things would not have been inducements; but as for me, I am tormented with an everlasting itch for things remote. I love to sail forbidden seas, and land on barbarous coasts. Not ignoring what is good, I am quick to perceive a horror, and could still be social with it—would they let me—since it is but well to be on friendly terms with all the inmates of the place one lodges in.

By reason of these things, then, the whaling voyage was welcome; the great flood-gates of the wonder-world swung open, and in the wild conceits that swayed me to my purpose, two and two there floated into my inmost soul, endless processions of the whale, and, mid most of them all, one grand hooded phantom, like a snow hill in the air.






CHAPTER 2. The Carpet-Bag.
I stuffed a shirt or two into my old carpet-bag, tucked it under my arm, and started for Cape Horn and the Pacific. Quitting the good city of old Manhatto, I duly arrived in New Bedford. It was a Saturday night in December. Much was I disappointed upon learning that the little packet for Nantucket had already sailed, and that no way of reaching that place would offer, till the following Monday.

As most young candidates for the pains and penalties of whaling stop at this same New Bedford, thence to embark on their voyage, it may as well be related that I, for one, had no idea of so doing. For my mind was made up to sail in no other than a Nantucket craft, because there was a fine, boisterous something about everything connected with that famous old island, which amazingly pleased me. Besides though New Bedford has of late been gradually monopolising the business of whaling, and though in this matter poor old Nantucket is now much behind her, yet Nantucket was her great original—the Tyre of this Carthage;—the place where the first dead American whale was stranded. Where else but from Nantucket did those aboriginal whalemen, the Red-Men, first sally out in canoes to give chase to the Leviathan? And where but from Nantucket, too, did that first adventurous little sloop put forth, partly laden with imported cobblestones—so goes the story—to throw at the whales, in order to discover when they were nigh enough to risk a harpoon from the bowsprit?

Now having a night, a day, and still another night following before me in New Bedford, ere I could embark for my destined port, it became a matter of concernment where I was to eat and sleep meanwhile. It was a very dubious-looking, nay, a very dark and dismal night, bitingly cold and cheerless. I knew no one in the place. With anxious grapnels I had sounded my pocket, and only brought up a few pieces of silver,—So, wherever you go, Ishmael, said I to myself, as I stood in the middle of a dreary street shouldering my bag, and comparing the gloom towards the north with the darkness towards the south—wherever in your wisdom you may conclude to lodge for the night, my dear Ishmael, be sure to inquire the price, and don’t be too particular.

With halting steps I paced the streets, and passed the sign of “The Crossed Harpoons”—but it looked too expensive and jolly there. Further on, from the bright red windows of the “Sword-Fish Inn,” there came such fervent rays, that it seemed to have melted the packed snow and ice from before the house, for everywhere else the congealed frost lay ten inches thick in a hard, asphaltic pavement,—rather weary for me, when I struck my foot against the flinty projections, because from hard, remorseless service the soles of my boots were in a most miserable plight. Too expensive and jolly, again thought I, pausing one moment to watch the broad glare in the street, and hear the sounds of the tinkling glasses within. But go on, Ishmael, said I at last; don’t you hear? get away from before the door; your patched boots are stopping the way. So on I went. I now by instinct followed the streets that took me waterward, for there, doubtless, were the cheapest, if not the cheeriest inns.

Such dreary streets! blocks of blackness, not houses, on either hand, and here and there a candle, like a candle moving about in a tomb. At this hour of the night, of the last day of the week, that quarter of the town proved all but deserted. But presently I came to a smoky light proceeding from a low, wide building, the door of which stood invitingly open. It had a careless look, as if it were meant for the uses of the public; so, entering, the first thing I did was to stumble over an ash-box in the porch. Ha! thought I, ha, as the flying particles almost choked me, are these ashes from that destroyed city, Gomorrah? But “The Crossed Harpoons,” and “The Sword-Fish?”—this, then must needs be the sign of “The Trap.” However, I picked myself up and hearing a loud voice within, pushed on and opened a second, interior door.

It seemed the great Black Parliament sitting in Tophet. A hundred black faces turned round in their rows to peer; and beyond, a black Angel of Doom was beating a book in a pulpit. It was a negro church; and the preacher’s text was about the blackness of darkness, and the weeping and wailing and teeth-gnashing there. Ha, Ishmael, muttered I, backing out, Wretched entertainment at the sign of ‘The Trap!’

Moving on, I at last came to a dim sort of light not far from the docks, and heard a forlorn creaking in the air; and looking up, saw a swinging sign over the door with a white painting upon it, faintly representing a tall straight jet of misty spray, and these words underneath—“The Spouter Inn:—Peter Coffin.”

Coffin?—Spouter?—Rather ominous in that particular connexion, thought I. But it is a common name in Nantucket, they say, and I suppose this Peter here is an emigrant from there. As the light looked so dim, and the place, for the time, looked quiet enough, and the dilapidated little wooden house itself looked as if it might have been carted here from the ruins of some burnt district, and as the swinging sign had a poverty-stricken sort of creak to it, I thought that here was the very spot for cheap lodgings, and the best of pea coffee.

It was a queer sort of place—a gable-ended old house, one side palsied as it were, and leaning over sadly. It stood on a sharp bleak corner, where that tempestuous wind Euroclydon kept up a worse howling than ever it did about poor Paul’s tossed craft. Euroclydon, nevertheless, is a mighty pleasant zephyr to any one in-doors, with his feet on the hob quietly toasting for bed. “In judging of that tempestuous wind called Euroclydon,” says an old writer—of whose works I possess the only copy extant—“it maketh a marvellous difference, whether thou lookest out at it from a glass window where the frost is all on the outside, or whether thou observest it from that sashless window, where the frost is on both sides, and of which the wight Death is the only glazier.” True enough, thought I, as this passage occurred to my mind—old black-letter, thou reasonest well. Yes, these eyes are windows, and this body of mine is the house. What a pity they didn’t stop up the chinks and the crannies though, and thrust in a little lint here and there. But it’s too late to make any improvements now. The universe is finished; the copestone is on, and the chips were carted off a million years ago. Poor Lazarus there, chattering his teeth against the curbstone for his pillow, and shaking off his tatters with his shiverings, he might plug up both ears with rags, and put a corn-cob into his mouth, and yet that would not keep out the tempestuous Euroclydon. Euroclydon! says old Dives, in his red silken wrapper—(he had a redder one afterwards) pooh, pooh! What a fine frosty night; how Orion glitters; what northern lights! Let them talk of their oriental summer climes of everlasting conservatories; give me the privilege of making my own summer with my own coals.

But what thinks Lazarus? Can he warm his blue hands by holding them up to the grand northern lights? Would not Lazarus rather be in Sumatra than here? Would he not far rather lay him down lengthwise along the line of the equator; yea, ye gods! go down to the fiery pit itself, in order to keep out this frost?

Now, that Lazarus should lie stranded there on the curbstone before the door of Dives, this is more wonderful than that an iceberg should be moored to one of the Moluccas. Yet Dives himself, he too lives like a Czar in an ice palace made of frozen sighs, and being a president of a temperance society, he only drinks the tepid tears of orphans.

But no more of this blubbering now, we are going a-whaling, and there is plenty of that yet to come. Let us scrape the ice from our frosted feet, and see what sort of a place this “Spouter” may be.






CHAPTER 3. The Spouter-Inn.
Entering that gable-ended Spouter-Inn, you found yourself in a wide, low, straggling entry with old-fashioned wainscots, reminding one of the bulwarks of some condemned old craft. On one side hung a very large oilpainting so thoroughly besmoked, and every way defaced, that in the unequal crosslights by which you viewed it, it was only by diligent study and a series of systematic visits to it, and careful inquiry of the neighbors, that you could any way arrive at an understanding of its purpose. Such unaccountable masses of shades and shadows, that at first you almost thought some ambitious young artist, in the time of the New England hags, had endeavored to delineate chaos bewitched. But by dint of much and earnest contemplation, and oft repeated ponderings, and especially by throwing open the little window towards the back of the entry, you at last come to the conclusion that such an idea, however wild, might not be altogether unwarranted.

But what most puzzled and confounded you was a long, limber, portentous, black mass of something hovering in the centre of the picture over three blue, dim, perpendicular lines floating in a nameless yeast. A boggy, soggy, squitchy picture truly, enough to drive a nervous man distracted. Yet was there a sort of indefinite, half-attained, unimaginable sublimity about it that fairly froze you to it, till you involuntarily took an oath with yourself to find out what that marvellous painting meant. Ever and anon a bright, but, alas, deceptive idea would dart you through.—It’s the Black Sea in a midnight gale.—It’s the unnatural combat of the four primal elements.—It’s a blasted heath.—It’s a Hyperborean winter scene.—It’s the breaking-up of the icebound stream of Time. But at last all these fancies yielded to that one portentous something in the picture’s midst. That once found out, and all the rest were plain. But stop; does it not bear a faint resemblance to a gigantic fish? even the great leviathan himself?

In fact, the artist’s design seemed this: a final theory of my own, partly based upon the aggregated opinions of many aged persons with whom I conversed upon the subject. The picture represents a Cape-Horner in a great hurricane; the half-foundered ship weltering there with its three dismantled masts alone visible; and an exasperated whale, purposing to spring clean over the craft, is in the enormous act of impaling himself upon the three mast-heads.

The opposite wall of this entry was hung all over with a heathenish array of monstrous clubs and spears. Some were thickly set with glittering teeth resembling ivory saws; others were tufted with knots of human hair; and one was sickle-shaped, with a vast handle sweeping round like the segment made in the new-mown grass by a long-armed mower. You shuddered as you gazed, and wondered what monstrous cannibal and savage could ever have gone a death-harvesting with such a hacking, horrifying implement. Mixed with these were rusty old whaling lances and harpoons all broken and deformed. Some were storied weapons. With this once long lance, now wildly elbowed, fifty years ago did Nathan Swain kill fifteen whales between a sunrise and a sunset. And that harpoon—so like a corkscrew now—was flung in Javan seas, and run away with by a whale, years afterwards slain off the Cape of Blanco. The original iron entered nigh the tail, and, like a restless needle sojourning in the body of a man, travelled full forty feet, and at last was found imbedded in the hump.

Crossing this dusky entry, and on through yon low-arched way—cut through what in old times must have been a great central chimney with fireplaces all round—you enter the public room. A still duskier place is this, with such low ponderous beams above, and such old wrinkled planks beneath, that you would almost fancy you trod some old craft’s cockpits, especially of such a howling night, when this corner-anchored old ark rocked so furiously. On one side stood a long, low, shelf-like table covered with cracked glass cases, filled with dusty rarities gathered from this wide world’s remotest nooks. Projecting from the further angle of the room stands a dark-looking den—the bar—a rude attempt at a right whale’s head. Be that how it may, there stands the vast arched bone of the whale’s jaw, so wide, a coach might almost drive beneath it. Within are shabby shelves, ranged round with old decanters, bottles, flasks; and in those jaws of swift destruction, like another cursed Jonah (by which name indeed they called him), bustles a little withered old man, who, for their money, dearly sells the sailors deliriums and death.

Abominable are the tumblers into which he pours his poison. Though true cylinders without—within, the villanous green goggling glasses deceitfully tapered downwards to a cheating bottom. Parallel meridians rudely pecked into the glass, surround these footpads’ goblets. Fill to this mark, and your charge is but a penny; to this a penny more; and so on to the full glass—the Cape Horn measure, which you may gulp down for a shilling.

Upon entering the place I found a number of young seamen gathered about a table, examining by a dim light divers specimens of skrimshander. I sought the landlord, and telling him I desired to be accommodated with a room, received for answer that his house was full—not a bed unoccupied. “But avast,” he added, tapping his forehead, “you haint no objections to sharing a harpooneer’s blanket, have ye? I s’pose you are goin’ a-whalin’, so you’d better get used to that sort of thing.”

I told him that I never liked to sleep two in a bed; that if I should ever do so, it would depend upon who the harpooneer might be, and that if he (the landlord) really had no other place for me, and the harpooneer was not decidedly objectionable, why rather than wander further about a strange town on so bitter a night, I would put up with the half of any decent man’s blanket.

“I thought so. All right; take a seat. Supper?—you want supper? Supper’ll be ready directly.”

I sat down on an old wooden settle, carved all over like a bench on the Battery. At one end a ruminating tar was still further adorning it with his jack-knife, stooping over and diligently working away at the space between his legs. He was trying his hand at a ship under full sail, but he didn’t make much headway, I thought.

At last some four or five of us were summoned to our meal in an adjoining room. It was cold as Iceland—no fire at all—the landlord said he couldn’t afford it. Nothing but two dismal tallow candles, each in a winding sheet. We were fain to button up our monkey jackets, and hold to our lips cups of scalding tea with our half frozen fingers. But the fare was of the most substantial kind—not only meat and potatoes, but dumplings; good heavens! dumplings for supper! One young fellow in a green box coat, addressed himself to these dumplings in a most direful manner.

“My boy,” said the landlord, “you’ll have the nightmare to a dead sartainty.”

“Landlord,” I whispered, “that aint the harpooneer is it?”

“Oh, no,” said he, looking a sort of diabolically funny, “the harpooneer is a dark complexioned chap. He never eats dumplings, he don’t—he eats nothing but steaks, and he likes ’em rare.”

“The devil he does,” says I. “Where is that harpooneer? Is he here?”

“He’ll be here afore long,” was the answer.

I could not help it, but I began to feel suspicious of this “dark complexioned” harpooneer. At any rate, I made up my mind that if it so turned out that we should sleep together, he must undress and get into bed before I did.

Supper over, the company went back to the bar-room, when, knowing not what else to do with myself, I resolved to spend the rest of the evening as a looker on.

Presently a rioting noise was heard without. Starting up, the landlord cried, “That’s the Grampus’s crew. I seed her reported in the offing this morning; a three years’ voyage, and a full ship. Hurrah, boys; now we’ll have the latest news from the Feegees.”

A tramping of sea boots was heard in the entry; the door was flung open, and in rolled a wild set of mariners enough. Enveloped in their shaggy watch coats, and with their heads muffled in woollen comforters, all bedarned and ragged, and their beards stiff with icicles, they seemed an eruption of bears from Labrador. They had just landed from their boat, and this was the first house they entered. No wonder, then, that they made a straight wake for the whale’s mouth—the bar—when the wrinkled little old Jonah, there officiating, soon poured them out brimmers all round. One complained of a bad cold in his head, upon which Jonah mixed him a pitch-like potion of gin and molasses, which he swore was a sovereign cure for all colds and catarrhs whatsoever, never mind of how long standing, or whether caught off the coast of Labrador, or on the weather side of an ice-island.

The liquor soon mounted into their heads, as it generally does even with the arrantest topers newly landed from sea, and they began capering about most obstreperously.

I observed, however, that one of them held somewhat aloof, and though he seemed desirous not to spoil the hilarity of his shipmates by his own sober face, yet upon the whole he refrained from making as much noise as the rest. This man interested me at once; and since the sea-gods had ordained that he should soon become my shipmate (though but a sleeping-partner one, so far as this narrative is concerned), I will here venture upon a little description of him. He stood full six feet in height, with noble shoulders, and a chest like a coffer-dam. I have seldom seen such brawn in a man. His face was deeply brown and burnt, making his white teeth dazzling by the contrast; while in the deep shadows of his eyes floated some reminiscences that did not seem to give him much joy. His voice at once announced that he was a Southerner, and from his fine stature, I thought he must be one of those tall mountaineers from the Alleghanian Ridge in Virginia. When the revelry of his companions had mounted to its height, this man slipped away unobserved, and I saw no more of him till he became my comrade on the sea. In a few minutes, however, he was missed by his shipmates, and being, it seems, for some reason a huge favourite with them, they raised a cry of “Bulkington! Bulkington! where’s Bulkington?” and darted out of the house in pursuit of him.

It was now about nine o’clock, and the room seeming almost supernaturally quiet after these orgies, I began to congratulate myself upon a little plan that had occurred to me just previous to the entrance of the seamen.

No man prefers to sleep two in a bed. In fact, you would a good deal rather not sleep with your own brother. I don’t know how it is, but people like to be private when they are sleeping. And when it comes to sleeping with an unknown stranger, in a strange inn, in a strange town, and that stranger a harpooneer, then your objections indefinitely multiply. Nor was there any earthly reason why I as a sailor should sleep two in a bed, more than anybody else; for sailors no more sleep two in a bed at sea, than bachelor Kings do ashore. To be sure they all sleep together in one apartment, but you have your own hammock, and cover yourself with your own blanket, and sleep in your own skin.

The more I pondered over this harpooneer, the more I abominated the thought of sleeping with him. It was fair to presume that being a harpooneer, his linen or woollen, as the case might be, would not be of the tidiest, certainly none of the finest. I began to twitch all over. Besides, it was getting late, and my decent harpooneer ought to be home and going bedwards. Suppose now, he should tumble in upon me at midnight—how could I tell from what vile hole he had been coming?

“Landlord! I’ve changed my mind about that harpooneer.—I shan’t sleep with him. I’ll try the bench here.”

“Just as you please; I’m sorry I can’t spare ye a tablecloth for a mattress, and it’s a plaguy rough board here”—feeling of the knots and notches. “But wait a bit, Skrimshander; I’ve got a carpenter’s plane there in the bar—wait, I say, and I’ll make ye snug enough.” So saying he procured the plane; and with his old silk handkerchief first dusting the bench, vigorously set to planing away at my bed, the while grinning like an ape. The shavings flew right and left; till at last the plane-iron came bump against an indestructible knot. The landlord was near spraining his wrist, and I told him for heaven’s sake to quit—the bed was soft enough to suit me, and I did not know how all the planing in the world could make eider down of a pine plank. So gathering up the shavings with another grin, and throwing them into the great stove in the middle of the room, he went about his business, and left me in a brown study.

I now took the measure of the bench, and found that it was a foot too short; but that could be mended with a chair. But it was a foot too narrow, and the other bench in the room was about four inches higher than the planed one—so there was no yoking them. I then placed the first bench lengthwise along the only clear space against the wall, leaving a little interval between, for my back to settle down in. But I soon found that there came such a draught of cold air over me from under the sill of the window, that this plan would never do at all, especially as another current from the rickety door met the one from the window, and both together formed a series of small whirlwinds in the immediate vicinity of the spot where I had thought to spend the night.

The devil fetch that harpooneer, thought I, but stop, couldn’t I steal a march on him—bolt his door inside, and jump into his bed, not to be wakened by the most violent knockings? It seemed no bad idea; but upon second thoughts I dismissed it. For who could tell but what the next morning, so soon as I popped out of the room, the harpooneer might be standing in the entry, all ready to knock me down!

Still, looking round me again, and seeing no possible chance of spending a sufferable night unless in some other person’s bed, I began to think that after all I might be cherishing unwarrantable prejudices against this unknown harpooneer. Thinks I, I’ll wait awhile; he must be dropping in before long. I’ll have a good look at him then, and perhaps we may become jolly good bedfellows after all—there’s no telling.

But though the other boarders kept coming in by ones, twos, and threes, and going to bed, yet no sign of my harpooneer.

“Landlord!” said I, “what sort of a chap is he—does he always keep such late hours?” It was now hard upon twelve o’clock.

The landlord chuckled again with his lean chuckle, and seemed to be mightily tickled at something beyond my comprehension. “No,” he answered, “generally he’s an early bird—airley to bed and airley to rise—yes, he’s the bird what catches the worm. But to-night he went out a peddling, you see, and I don’t see what on airth keeps him so late, unless, may be, he can’t sell his head.”

“Can’t sell his head?—What sort of a bamboozingly story is this you are telling me?” getting into a towering rage. “Do you pretend to say, landlord, that this harpooneer is actually engaged this blessed Saturday night, or rather Sunday morning, in peddling his head around this town?”

“That’s precisely it,” said the landlord, “and I told him he couldn’t sell it here, the market’s overstocked.”

“With what?” shouted I.

“With heads to be sure; ain’t there too many heads in the world?”

“I tell you what it is, landlord,” said I quite calmly, “you’d better stop spinning that yarn to me—I’m not green.”

“May be not,” taking out a stick and whittling a toothpick, “but I rayther guess you’ll be done brown if that ere harpooneer hears you a slanderin’ his head.”

“I’ll break it for him,” said I, now flying into a passion again at this unaccountable farrago of the landlord’s.

“It’s broke a’ready,” said he.

“Broke,” said I—“broke, do you mean?”

“Sartain, and that’s the very reason he can’t sell it, I guess.”

“Landlord,” said I, going up to him as cool as Mt. Hecla in a snow-storm—“landlord, stop whittling. You and I must understand one another, and that too without delay. I come to your house and want a bed; you tell me you can only give me half a one; that the other half belongs to a certain harpooneer. And about this harpooneer, whom I have not yet seen, you persist in telling me the most mystifying and exasperating stories tending to beget in me an uncomfortable feeling towards the man whom you design for my bedfellow—a sort of connexion, landlord, which is an intimate and confidential one in the highest degree. I now demand of you to speak out and tell me who and what this harpooneer is, and whether I shall be in all respects safe to spend the night with him. And in the first place, you will be so good as to unsay that story about selling his head, which if true I take to be good evidence that this harpooneer is stark mad, and I’ve no idea of sleeping with a madman; and you, sir, you I mean, landlord, you, sir, by trying to induce me to do so knowingly, would thereby render yourself liable to a criminal prosecution.”

“Wall,” said the landlord, fetching a long breath, “that’s a purty long sarmon for a chap that rips a little now and then. But be easy, be easy, this here harpooneer I have been tellin’ you of has just arrived from the south seas, where he bought up a lot of ’balmed New Zealand heads (great curios, you know), and he’s sold all on ’em but one, and that one he’s trying to sell to-night, cause to-morrow’s Sunday, and it would not do to be sellin’ human heads about the streets when folks is goin’ to churches. He wanted to, last Sunday, but I stopped him just as he was goin’ out of the door with four heads strung on a string, for all the airth like a string of inions.”

This account cleared up the otherwise unaccountable mystery, and showed that the landlord, after all, had had no idea of fooling me—but at the same time what could I think of a harpooneer who stayed out of a Saturday night clean into the holy Sabbath, engaged in such a cannibal business as selling the heads of dead idolators?

“Depend upon it, landlord, that harpooneer is a dangerous man.”

“He pays reg’lar,” was the rejoinder. “But come, it’s getting dreadful late, you had better be turning flukes—it’s a nice bed; Sal and me slept in that ere bed the night we were spliced. There’s plenty of room for two to kick about in that bed; it’s an almighty big bed that. Why, afore we give it up, Sal used to put our Sam and little Johnny in the foot of it. But I got a dreaming and sprawling about one night, and somehow, Sam got pitched on the floor, and came near breaking his arm. Arter that, Sal said it wouldn’t do. Come along here, I’ll give ye a glim in a jiffy;” and so saying he lighted a candle and held it towards me, offering to lead the way. But I stood irresolute; when looking at a clock in the corner, he exclaimed “I vum it’s Sunday—you won’t see that harpooneer to-night; he’s come to anchor somewhere—come along then; do come; won’t ye come?”

I considered the matter a moment, and then up stairs we went, and I was ushered into a small room, cold as a clam, and furnished, sure enough, with a prodigious bed, almost big enough indeed for any four harpooneers to sleep abreast.

“There,” said the landlord, placing the candle on a crazy old sea chest that did double duty as a wash-stand and centre table; “there, make yourself comfortable now, and good night to ye.” I turned round from eyeing the bed, but he had disappeared.

Folding back the counterpane, I stooped over the bed. Though none of the most elegant, it yet stood the scrutiny tolerably well. I then glanced round the room; and besides the bedstead and centre table, could see no other furniture belonging to the place, but a rude shelf, the four walls, and a papered fireboard representing a man striking a whale. Of things not properly belonging to the room, there was a hammock lashed up, and thrown upon the floor in one corner; also a large seaman’s bag, containing the harpooneer’s wardrobe, no doubt in lieu of a land trunk. Likewise, there was a parcel of outlandish bone fish hooks on the shelf over the fire-place, and a tall harpoon standing at the head of the bed.

But what is this on the chest? I took it up, and held it close to the light, and felt it, and smelt it, and tried every way possible to arrive at some satisfactory conclusion concerning it. I can compare it to nothing but a large door mat, ornamented at the edges with little tinkling tags something like the stained porcupine quills round an Indian moccasin. There was a hole or slit in the middle of this mat, as you see the same in South American ponchos. But could it be possible that any sober harpooneer would get into a door mat, and parade the streets of any Christian town in that sort of guise? I put it on, to try it, and it weighed me down like a hamper, being uncommonly shaggy and thick, and I thought a little damp, as though this mysterious harpooneer had been wearing it of a rainy day. I went up in it to a bit of glass stuck against the wall, and I never saw such a sight in my life. I tore myself out of it in such a hurry that I gave myself a kink in the neck.

I sat down on the side of the bed, and commenced thinking about this head-peddling harpooneer, and his door mat. After thinking some time on the bed-side, I got up and took off my monkey jacket, and then stood in the middle of the room thinking. I then took off my coat, and thought a little more in my shirt sleeves. But beginning to feel very cold now, half undressed as I was, and remembering what the landlord said about the harpooneer’s not coming home at all that night, it being so very late, I made no more ado, but jumped out of my pantaloons and boots, and then blowing out the light tumbled into bed, and commended myself to the care of heaven.

Whether that mattress was stuffed with corn-cobs or broken crockery, there is no telling, but I rolled about a good deal, and could not sleep for a long time. At last I slid off into a light doze, and had pretty nearly made a good offing towards the land of Nod, when I heard a heavy footfall in the passage, and saw a glimmer of light come into the room from under the door.

Lord save me, thinks I, that must be the harpooneer, the infernal head-peddler. But I lay perfectly still, and resolved not to say a word till spoken to. Holding a light in one hand, and that identical New Zealand head in the other, the stranger entered the room, and without looking towards the bed, placed his candle a good way off from me on the floor in one corner, and then began working away at the knotted cords of the large bag I before spoke of as being in the room. I was all eagerness to see his face, but he kept it averted for some time while employed in unlacing the bag’s mouth. This accomplished, however, he turned round—when, good heavens! what a sight! Such a face! It was of a dark, purplish, yellow colour, here and there stuck over with large blackish looking squares. Yes, it’s just as I thought, he’s a terrible bedfellow; he’s been in a fight, got dreadfully cut, and here he is, just from the surgeon. But at that moment he chanced to turn his face so towards the light, that I plainly saw they could not be sticking-plasters at all, those black squares on his cheeks. They were stains of some sort or other. At first I knew not what to make of this; but soon an inkling of the truth occurred to me. I remembered a story of a white man—a whaleman too—who, falling among the cannibals, had been tattooed by them. I concluded that this harpooneer, in the course of his distant voyages, must have met with a similar adventure. And what is it, thought I, after all! It’s only his outside; a man can be honest in any sort of skin. But then, what to make of his unearthly complexion, that part of it, I mean, lying round about, and completely independent of the squares of tattooing. To be sure, it might be nothing but a good coat of tropical tanning; but I never heard of a hot sun’s tanning a white man into a purplish yellow one. However, I had never been in the South Seas; and perhaps the sun there produced these extraordinary effects upon the skin. Now, while all these ideas were passing through me like lightning, this harpooneer never noticed me at all. But, after some difficulty having opened his bag, he commenced fumbling in it, and presently pulled out a sort of tomahawk, and a seal-skin wallet with the hair on. Placing these on the old chest in the middle of the room, he then took the New Zealand head—a ghastly thing enough—and crammed it down into the bag. He now took off his hat—a new beaver hat—when I came nigh singing out with fresh surprise. There was no hair on his head—none to speak of at least—nothing but a small scalp-knot twisted up on his forehead. His bald purplish head now looked for all the world like a mildewed skull. Had not the stranger stood between me and the door, I would have bolted out of it quicker than ever I bolted a dinner.

Even as it was, I thought something of slipping out of the window, but it was the second floor back. I am no coward, but what to make of this head-peddling purple rascal altogether passed my comprehension. Ignorance is the parent of fear, and being completely nonplussed and confounded about the stranger, I confess I was now as much afraid of him as if it was the devil himself who had thus broken into my room at the dead of night. In fact, I was so afraid of him that I was not game enough just then to address him, and demand a satisfactory answer concerning what seemed inexplicable in him.

Meanwhile, he continued the business of undressing, and at last showed his chest and arms. As I live, these covered parts of him were checkered with the same squares as his face; his back, too, was all over the same dark squares; he seemed to have been in a Thirty Years’ War, and just escaped from it with a sticking-plaster shirt. Still more, his very legs were marked, as if a parcel of dark green frogs were running up the trunks of young palms. It was now quite plain that he must be some abominable savage or other shipped aboard of a whaleman in the South Seas, and so landed in this Christian country. I quaked to think of it. A peddler of heads too—perhaps the heads of his own brothers. He might take a fancy to mine—heavens! look at that tomahawk!

But there was no time for shuddering, for now the savage went about something that completely fascinated my attention, and convinced me that he must indeed be a heathen. Going to his heavy grego, or wrapall, or dreadnaught, which he had previously hung on a chair, he fumbled in the pockets, and produced at length a curious little deformed image with a hunch on its back, and exactly the colour of a three days’ old Congo baby. Remembering the embalmed head, at first I almost thought that this black manikin was a real baby preserved in some similar manner. But seeing that it was not at all limber, and that it glistened a good deal like polished ebony, I concluded that it must be nothing but a wooden idol, which indeed it proved to be. For now the savage goes up to the empty fire-place, and removing the papered fire-board, sets up this little hunch-backed image, like a tenpin, between the andirons. The chimney jambs and all the bricks inside were very sooty, so that I thought this fire-place made a very appropriate little shrine or chapel for his Congo idol.

I now screwed my eyes hard towards the half hidden image, feeling but ill at ease meantime—to see what was next to follow. First he takes about a double handful of shavings out of his grego pocket, and places them carefully before the idol; then laying a bit of ship biscuit on top and applying the flame from the lamp, he kindled the shavings into a sacrificial blaze. Presently, after many hasty snatches into the fire, and still hastier withdrawals of his fingers (whereby he seemed to be scorching them badly), he at last succeeded in drawing out the biscuit; then blowing off the heat and ashes a little, he made a polite offer of it to the little negro. But the little devil did not seem to fancy such dry sort of fare at all; he never moved his lips. All these strange antics were accompanied by still stranger guttural noises from the devotee, who seemed to be praying in a sing-song or else singing some pagan psalmody or other, during which his face twitched about in the most unnatural manner. At last extinguishing the fire, he took the idol up very unceremoniously, and bagged it again in his grego pocket as carelessly as if he were a sportsman bagging a dead woodcock.

All these queer proceedings increased my uncomfortableness, and seeing him now exhibiting strong symptoms of concluding his business operations, and jumping into bed with me, I thought it was high time, now or never, before the light was put out, to break the spell in which I had so long been bound.

But the interval I spent in deliberating what to say, was a fatal one. Taking up his tomahawk from the table, he examined the head of it for an instant, and then holding it to the light, with his mouth at the handle, he puffed out great clouds of tobacco smoke. The next moment the light was extinguished, and this wild cannibal, tomahawk between his teeth, sprang into bed with me. I sang out, I could not help it now; and giving a sudden grunt of astonishment he began feeling me.

Stammering out something, I knew not what, I rolled away from him against the wall, and then conjured him, whoever or whatever he might be, to keep quiet, and let me get up and light the lamp again. But his guttural responses satisfied me at once that he but ill comprehended my meaning.

“Who-e debel you?”—he at last said—“you no speak-e, dam-me, I kill-e.” And so saying the lighted tomahawk began flourishing about me in the dark.

“Landlord, for God’s sake, Peter Coffin!” shouted I. “Landlord! Watch! Coffin! Angels! save me!”

“Speak-e! tell-ee me who-ee be, or dam-me, I kill-e!” again growled the cannibal, while his horrid flourishings of the tomahawk scattered the hot tobacco ashes about me till I thought my linen would get on fire. But thank heaven, at that moment the landlord came into the room light in hand, and leaping from the bed I ran up to him.

“Don’t be afraid now,” said he, grinning again, “Queequeg here wouldn’t harm a hair of your head.”

“Stop your grinning,” shouted I, “and why didn’t you tell me that that infernal harpooneer was a cannibal?”

“I thought ye know’d it;—didn’t I tell ye, he was a peddlin’ heads around town?—but turn flukes again and go to sleep. Queequeg, look here—you sabbee me, I sabbee—you this man sleepe you—you sabbee?”

“Me sabbee plenty”—grunted Queequeg, puffing away at his pipe and sitting up in bed.

“You gettee in,” he added, motioning to me with his tomahawk, and throwing the clothes to one side. He really did this in not only a civil but a really kind and charitable way. I stood looking at him a moment. For all his tattooings he was on the whole a clean, comely looking cannibal. What’s all this fuss I have been making about, thought I to myself—the man’s a human being just as I am: he has just as much reason to fear me, as I have to be afraid of him. Better sleep with a sober cannibal than a drunken Christian.

“Landlord,” said I, “tell him to stash his tomahawk there, or pipe, or whatever you call it; tell him to stop smoking, in short, and I will turn in with him. But I don’t fancy having a man smoking in bed with me. It’s dangerous. Besides, I ain’t insured.”

This being told to Queequeg, he at once complied, and again politely motioned me to get into bed—rolling over to one side as much as to say—“I won’t touch a leg of ye.”

“Good night, landlord,” said I, “you may go.”

I turned in, and never slept better in my life.






CHAPTER 4. The Counterpane.
Upon waking next morning about daylight, I found Queequeg’s arm thrown over me in the most loving and affectionate manner. You had almost thought I had been his wife. The counterpane was of patchwork, full of odd little parti-coloured squares and triangles; and this arm of his tattooed all over with an interminable Cretan labyrinth of a figure, no two parts of which were of one precise shade—owing I suppose to his keeping his arm at sea unmethodically in sun and shade, his shirt sleeves irregularly rolled up at various times—this same arm of his, I say, looked for all the world like a strip of that same patchwork quilt. Indeed, partly lying on it as the arm did when I first awoke, I could hardly tell it from the quilt, they so blended their hues together; and it was only by the sense of weight and pressure that I could tell that Queequeg was hugging me.

My sensations were strange. Let me try to explain them. When I was a child, I well remember a somewhat similar circumstance that befell me; whether it was a reality or a dream, I never could entirely settle. The circumstance was this. I had been cutting up some caper or other—I think it was trying to crawl up the chimney, as I had seen a little sweep do a few days previous; and my stepmother who, somehow or other, was all the time whipping me, or sending me to bed supperless,—my mother dragged me by the legs out of the chimney and packed me off to bed, though it was only two o’clock in the afternoon of the 21st June, the longest day in the year in our hemisphere. I felt dreadfully. But there was no help for it, so up stairs I went to my little room in the third floor, undressed myself as slowly as possible so as to kill time, and with a bitter sigh got between the sheets.

I lay there dismally calculating that sixteen entire hours must elapse before I could hope for a resurrection. Sixteen hours in bed! the small of my back ached to think of it. And it was so light too; the sun shining in at the window, and a great rattling of coaches in the streets, and the sound of gay voices all over the house. I felt worse and worse—at last I got up, dressed, and softly going down in my stockinged feet, sought out my stepmother, and suddenly threw myself at her feet, beseeching her as a particular favour to give me a good slippering for my misbehaviour; anything indeed but condemning me to lie abed such an unendurable length of time. But she was the best and most conscientious of stepmothers, and back I had to go to my room. For several hours I lay there broad awake, feeling a great deal worse than I have ever done since, even from the greatest subsequent misfortunes. At last I must have fallen into a troubled nightmare of a doze; and slowly waking from it—half steeped in dreams—I opened my eyes, and the before sun-lit room was now wrapped in outer darkness. Instantly I felt a shock running through all my frame; nothing was to be seen, and nothing was to be heard; but a supernatural hand seemed placed in mine. My arm hung over the counterpane, and the nameless, unimaginable, silent form or phantom, to which the hand belonged, seemed closely seated by my bed-side. For what seemed ages piled on ages, I lay there, frozen with the most awful fears, not daring to drag away my hand; yet ever thinking that if I could but stir it one single inch, the horrid spell would be broken. I knew not how this consciousness at last glided away from me; but waking in the morning, I shudderingly remembered it all, and for days and weeks and months afterwards I lost myself in confounding attempts to explain the mystery. Nay, to this very hour, I often puzzle myself with it.

Now, take away the awful fear, and my sensations at feeling the supernatural hand in mine were very similar, in their strangeness, to those which I experienced on waking up and seeing Queequeg’s pagan arm thrown round me. But at length all the past night’s events soberly recurred, one by one, in fixed reality, and then I lay only alive to the comical predicament. For though I tried to move his arm—unlock his bridegroom clasp—yet, sleeping as he was, he still hugged me tightly, as though naught but death should part us twain. I now strove to rouse him—“Queequeg!”—but his only answer was a snore. I then rolled over, my neck feeling as if it were in a horse-collar; and suddenly felt a slight scratch. Throwing aside the counterpane, there lay the tomahawk sleeping by the savage’s side, as if it were a hatchet-faced baby. A pretty pickle, truly, thought I; abed here in a strange house in the broad day, with a cannibal and a tomahawk! “Queequeg!—in the name of goodness, Queequeg, wake!” At length, by dint of much wriggling, and loud and incessant expostulations upon the unbecomingness of his hugging a fellow male in that matrimonial sort of style, I succeeded in extracting a grunt; and presently, he drew back his arm, shook himself all over like a Newfoundland dog just from the water, and sat up in bed, stiff as a pike-staff, looking at me, and rubbing his eyes as if he did not altogether remember how I came to be there, though a dim consciousness of knowing something about me seemed slowly dawning over him. Meanwhile, I lay quietly eyeing him, having no serious misgivings now, and bent upon narrowly observing so curious a creature. When, at last, his mind seemed made up touching the character of his bedfellow, and he became, as it were, reconciled to the fact; he jumped out upon the floor, and by certain signs and sounds gave me to understand that, if it pleased me, he would dress first and then leave me to dress afterwards, leaving the whole apartment to myself. Thinks I, Queequeg, under the circumstances, this is a very civilized overture; but, the truth is, these savages have an innate sense of delicacy, say what you will; it is marvellous how essentially polite they are. I pay this particular compliment to Queequeg, because he treated me with so much civility and consideration, while I was guilty of great rudeness; staring at him from the bed, and watching all his toilette motions; for the time my curiosity getting the better of my breeding. Nevertheless, a man like Queequeg you don’t see every day, he and his ways were well worth unusual regarding.

He commenced dressing at top by donning his beaver hat, a very tall one, by the by, and then—still minus his trowsers—he hunted up his boots. What under the heavens he did it for, I cannot tell, but his next movement was to crush himself—boots in hand, and hat on—under the bed; when, from sundry violent gaspings and strainings, I inferred he was hard at work booting himself; though by no law of propriety that I ever heard of, is any man required to be private when putting on his boots. But Queequeg, do you see, was a creature in the transition stage—neither caterpillar nor butterfly. He was just enough civilized to show off his outlandishness in the strangest possible manners. His education was not yet completed. He was an undergraduate. If he had not been a small degree civilized, he very probably would not have troubled himself with boots at all; but then, if he had not been still a savage, he never would have dreamt of getting under the bed to put them on. At last, he emerged with his hat very much dented and crushed down over his eyes, and began creaking and limping about the room, as if, not being much accustomed to boots, his pair of damp, wrinkled cowhide ones—probably not made to order either—rather pinched and tormented him at the first go off of a bitter cold morning.

Seeing, now, that there were no curtains to the window, and that the street being very narrow, the house opposite commanded a plain view into the room, and observing more and more the indecorous figure that Queequeg made, staving about with little else but his hat and boots on; I begged him as well as I could, to accelerate his toilet somewhat, and particularly to get into his pantaloons as soon as possible. He complied, and then proceeded to wash himself. At that time in the morning any Christian would have washed his face; but Queequeg, to my amazement, contented himself with restricting his ablutions to his chest, arms, and hands. He then donned his waistcoat, and taking up a piece of hard soap on the wash-stand centre table, dipped it into water and commenced lathering his face. I was watching to see where he kept his razor, when lo and behold, he takes the harpoon from the bed corner, slips out the long wooden stock, unsheathes the head, whets it a little on his boot, and striding up to the bit of mirror against the wall, begins a vigorous scraping, or rather harpooning of his cheeks. Thinks I, Queequeg, this is using Rogers’s best cutlery with a vengeance. Afterwards I wondered the less at this operation when I came to know of what fine steel the head of a harpoon is made, and how exceedingly sharp the long straight edges are always kept.

The rest of his toilet was soon achieved, and he proudly marched out of the room, wrapped up in his great pilot monkey jacket, and sporting his harpoon like a marshal’s baton.






CHAPTER 5. Breakfast.
I quickly followed suit, and descending into the bar-room accosted the grinning landlord very pleasantly. I cherished no malice towards him, though he had been skylarking with me not a little in the matter of my bedfellow.

However, a good laugh is a mighty good thing, and rather too scarce a good thing; the more’s the pity. So, if any one man, in his own proper person, afford stuff for a good joke to anybody, let him not be backward, but let him cheerfully allow himself to spend and be spent in that way. And the man that has anything bountifully laughable about him, be sure there is more in that man than you perhaps think for.

The bar-room was now full of the boarders who had been dropping in the night previous, and whom I had not as yet had a good look at. They were nearly all whalemen; chief mates, and second mates, and third mates, and sea carpenters, and sea coopers, and sea blacksmiths, and harpooneers, and ship keepers; a brown and brawny company, with bosky beards; an unshorn, shaggy set, all wearing monkey jackets for morning gowns.

You could pretty plainly tell how long each one had been ashore. This young fellow’s healthy cheek is like a sun-toasted pear in hue, and would seem to smell almost as musky; he cannot have been three days landed from his Indian voyage. That man next him looks a few shades lighter; you might say a touch of satin wood is in him. In the complexion of a third still lingers a tropic tawn, but slightly bleached withal; he doubtless has tarried whole weeks ashore. But who could show a cheek like Queequeg? which, barred with various tints, seemed like the Andes’ western slope, to show forth in one array, contrasting climates, zone by zone.

“Grub, ho!” now cried the landlord, flinging open a door, and in we went to breakfast.

They say that men who have seen the world, thereby become quite at ease in manner, quite self-possessed in company. Not always, though: Ledyard, the great New England traveller, and Mungo Park, the Scotch one; of all men, they possessed the least assurance in the parlor. But perhaps the mere crossing of Siberia in a sledge drawn by dogs as Ledyard did, or the taking a long solitary walk on an empty stomach, in the negro heart of Africa, which was the sum of poor Mungo’s performances—this kind of travel, I say, may not be the very best mode of attaining a high social polish. Still, for the most part, that sort of thing is to be had anywhere.

These reflections just here are occasioned by the circumstance that after we were all seated at the table, and I was preparing to hear some good stories about whaling; to my no small surprise, nearly every man maintained a profound silence. And not only that, but they looked embarrassed. Yes, here were a set of sea-dogs, many of whom without the slightest bashfulness had boarded great whales on the high seas—entire strangers to them—and duelled them dead without winking; and yet, here they sat at a social breakfast table—all of the same calling, all of kindred tastes—looking round as sheepishly at each other as though they had never been out of sight of some sheepfold among the Green Mountains. A curious sight; these bashful bears, these timid warrior whalemen!

But as for Queequeg—why, Queequeg sat there among them—at the head of the table, too, it so chanced; as cool as an icicle. To be sure I cannot say much for his breeding. His greatest admirer could not have cordially justified his bringing his harpoon into breakfast with him, and using it there without ceremony; reaching over the table with it, to the imminent jeopardy of many heads, and grappling the beefsteaks towards him. But that was certainly very coolly done by him, and every one knows that in most people’s estimation, to do anything coolly is to do it genteelly.

We will not speak of all Queequeg’s peculiarities here; how he eschewed coffee and hot rolls, and applied his undivided attention to beefsteaks, done rare. Enough, that when breakfast was over he withdrew like the rest into the public room, lighted his tomahawk-pipe, and was sitting there quietly digesting and smoking with his inseparable hat on, when I sallied out for a stroll.






CHAPTER 6. The Street.
If I had been astonished at first catching a glimpse of so outlandish an individual as Queequeg circulating among the polite society of a civilized town, that astonishment soon departed upon taking my first daylight stroll through the streets of New Bedford.

In thoroughfares nigh the docks, any considerable seaport will frequently offer to view the queerest looking nondescripts from foreign parts. Even in Broadway and Chestnut streets, Mediterranean mariners will sometimes jostle the affrighted ladies. Regent Street is not unknown to Lascars and Malays; and at Bombay, in the Apollo Green, live Yankees have often scared the natives. But New Bedford beats all Water Street and Wapping. In these last-mentioned haunts you see only sailors; but in New Bedford, actual cannibals stand chatting at street corners; savages outright; many of whom yet carry on their bones unholy flesh. It makes a stranger stare.

But, besides the Feegeeans, Tongatobooarrs, Erromanggoans, Pannangians, and Brighggians, and, besides the wild specimens of the whaling-craft which unheeded reel about the streets, you will see other sights still more curious, certainly more comical. There weekly arrive in this town scores of green Vermonters and New Hampshire men, all athirst for gain and glory in the fishery. They are mostly young, of stalwart frames; fellows who have felled forests, and now seek to drop the axe and snatch the whale-lance. Many are as green as the Green Mountains whence they came. In some things you would think them but a few hours old. Look there! that chap strutting round the corner. He wears a beaver hat and swallow-tailed coat, girdled with a sailor-belt and sheath-knife. Here comes another with a sou’-wester and a bombazine cloak.

No town-bred dandy will compare with a country-bred one—I mean a downright bumpkin dandy—a fellow that, in the dog-days, will mow his two acres in buckskin gloves for fear of tanning his hands. Now when a country dandy like this takes it into his head to make a distinguished reputation, and joins the great whale-fishery, you should see the comical things he does upon reaching the seaport. In bespeaking his sea-outfit, he orders bell-buttons to his waistcoats; straps to his canvas trowsers. Ah, poor Hay-Seed! how bitterly will burst those straps in the first howling gale, when thou art driven, straps, buttons, and all, down the throat of the tempest.

But think not that this famous town has only harpooneers, cannibals, and bumpkins to show her visitors. Not at all. Still New Bedford is a queer place. Had it not been for us whalemen, that tract of land would this day perhaps have been in as howling condition as the coast of Labrador. As it is, parts of her back country are enough to frighten one, they look so bony. The town itself is perhaps the dearest place to live in, in all New England. It is a land of oil, true enough: but not like Canaan; a land, also, of corn and wine. The streets do not run with milk; nor in the spring-time do they pave them with fresh eggs. Yet, in spite of this, nowhere in all America will you find more patrician-like houses; parks and gardens more opulent, than in New Bedford. Whence came they? how planted upon this once scraggy scoria of a country?

Go and gaze upon the iron emblematical harpoons round yonder lofty mansion, and your question will be answered. Yes; all these brave houses and flowery gardens came from the Atlantic, Pacific, and Indian oceans. One and all, they were harpooned and dragged up hither from the bottom of the sea. Can Herr Alexander perform a feat like that?

In New Bedford, fathers, they say, give whales for dowers to their daughters, and portion off their nieces with a few porpoises a-piece. You must go to New Bedford to see a brilliant wedding; for, they say, they have reservoirs of oil in every house, and every night recklessly burn their lengths in spermaceti candles.

In summer time, the town is sweet to see; full of fine maples—long avenues of green and gold. And in August, high in air, the beautiful and bountiful horse-chestnuts, candelabra-wise, proffer the passer-by their tapering upright cones of congregated blossoms. So omnipotent is art; which in many a district of New Bedford has superinduced bright terraces of flowers upon the barren refuse rocks thrown aside at creation’s final day.

And the women of New Bedford, they bloom like their own red roses. But roses only bloom in summer; whereas the fine carnation of their cheeks is perennial as sunlight in the seventh heavens. Elsewhere match that bloom of theirs, ye cannot, save in Salem, where they tell me the young girls breathe such musk, their sailor sweethearts smell them miles off shore, as though they were drawing nigh the odorous Moluccas instead of the Puritanic sands.






CHAPTER 7. The Chapel.
In this same New Bedford there stands a Whaleman’s Chapel, and few are the moody fishermen, shortly bound for the Indian Ocean or Pacific, who fail to make a Sunday visit to the spot. I am sure that I did not.

Returning from my first morning stroll, I again sallied out upon this special errand. The sky had changed from clear, sunny cold, to driving sleet and mist. Wrapping myself in my shaggy jacket of the cloth called bearskin, I fought my way against the stubborn storm. Entering, I found a small scattered congregation of sailors, and sailors’ wives and widows. A muffled silence reigned, only broken at times by the shrieks of the storm. Each silent worshipper seemed purposely sitting apart from the other, as if each silent grief were insular and incommunicable. The chaplain had not yet arrived; and there these silent islands of men and women sat steadfastly eyeing several marble tablets, with black borders, masoned into the wall on either side the pulpit. Three of them ran something like the following, but I do not pretend to quote:—

SACRED TO THE MEMORY OF JOHN TALBOT, Who, at the age of eighteen, was lost overboard, Near the Isle of Desolation, off Patagonia, November 1st, 1836. THIS TABLET Is erected to his Memory BY HIS SISTER.

SACRED TO THE MEMORY OF ROBERT LONG, WILLIS ELLERY, NATHAN COLEMAN, WALTER CANNY, SETH MACY, AND SAMUEL GLEIG, Forming one of the boats’ crews OF THE SHIP ELIZA Who were towed out of sight by a Whale, On the Off-shore Ground in the PACIFIC, December 31st, 1839. THIS MARBLE Is here placed by their surviving SHIPMATES.

SACRED TO THE MEMORY OF The late CAPTAIN EZEKIEL HARDY, Who in the bows of his boat was killed by a Sperm Whale on the coast of Japan, August 3d, 1833. THIS TABLET Is erected to his Memory BY HIS WIDOW.

Shaking off the sleet from my ice-glazed hat and jacket, I seated myself near the door, and turning sideways was surprised to see Queequeg near me. Affected by the solemnity of the scene, there was a wondering gaze of incredulous curiosity in his countenance. This savage was the only person present who seemed to notice my entrance; because he was the only one who could not read, and, therefore, was not reading those frigid inscriptions on the wall. Whether any of the relatives of the seamen whose names appeared there were now among the congregation, I knew not; but so many are the unrecorded accidents in the fishery, and so plainly did several women present wear the countenance if not the trappings of some unceasing grief, that I feel sure that here before me were assembled those, in whose unhealing hearts the sight of those bleak tablets sympathetically caused the old wounds to bleed afresh.

Oh! ye whose dead lie buried beneath the green grass; who standing among flowers can say—here, here lies my beloved; ye know not the desolation that broods in bosoms like these. What bitter blanks in those black-bordered marbles which cover no ashes! What despair in those immovable inscriptions! What deadly voids and unbidden infidelities in the lines that seem to gnaw upon all Faith, and refuse resurrections to the beings who have placelessly perished without a grave. As well might those tablets stand in the cave of Elephanta as here.

In what census of living creatures, the dead of mankind are included; why it is that a universal proverb says of them, that they tell no tales, though containing more secrets than the Goodwin Sands; how it is that to his name who yesterday departed for the other world, we prefix so significant and infidel a word, and yet do not thus entitle him, if he but embarks for the remotest Indies of this living earth; why the Life Insurance Companies pay death-forfeitures upon immortals; in what eternal, unstirring paralysis, and deadly, hopeless trance, yet lies antique Adam who died sixty round centuries ago; how it is that we still refuse to be comforted for those who we nevertheless maintain are dwelling in unspeakable bliss; why all the living so strive to hush all the dead; wherefore but the rumor of a knocking in a tomb will terrify a whole city. All these things are not without their meanings.

But Faith, like a jackal, feeds among the tombs, and even from these dead doubts she gathers her most vital hope.

It needs scarcely to be told, with what feelings, on the eve of a Nantucket voyage, I regarded those marble tablets, and by the murky light of that darkened, doleful day read the fate of the whalemen who had gone before me. Yes, Ishmael, the same fate may be thine. But somehow I grew merry again. Delightful inducements to embark, fine chance for promotion, it seems—aye, a stove boat will make me an immortal by brevet. Yes, there is death in this business of whaling—a speechlessly quick chaotic bundling of a man into Eternity. But what then? Methinks we have hugely mistaken this matter of Life and Death. Methinks that what they call my shadow here on earth is my true substance. Methinks that in looking at things spiritual, we are too much like oysters observing the sun through the water, and thinking that thick water the thinnest of air. Methinks my body is but the lees of my better being. In fact take my body who will, take it I say, it is not me. And therefore three cheers for Nantucket; and come a stove boat and stove body when they will, for stave my soul, Jove himself cannot.






CHAPTER 8. The Pulpit.
I had not been seated very long ere a man of a certain venerable robustness entered; immediately as the storm-pelted door flew back upon admitting him, a quick regardful eyeing of him by all the congregation, sufficiently attested that this fine old man was the chaplain. Yes, it was the famous Father Mapple, so called by the whalemen, among whom he was a very great favourite. He had been a sailor and a harpooneer in his youth, but for many years past had dedicated his life to the ministry. At the time I now write of, Father Mapple was in the hardy winter of a healthy old age; that sort of old age which seems merging into a second flowering youth, for among all the fissures of his wrinkles, there shone certain mild gleams of a newly developing bloom—the spring verdure peeping forth even beneath February’s snow. No one having previously heard his history, could for the first time behold Father Mapple without the utmost interest, because there were certain engrafted clerical peculiarities about him, imputable to that adventurous maritime life he had led. When he entered I observed that he carried no umbrella, and certainly had not come in his carriage, for his tarpaulin hat ran down with melting sleet, and his great pilot cloth jacket seemed almost to drag him to the floor with the weight of the water it had absorbed. However, hat and coat and overshoes were one by one removed, and hung up in a little space in an adjacent corner; when, arrayed in a decent suit, he quietly approached the pulpit.

Like most old fashioned pulpits, it was a very lofty one, and since a regular stairs to such a height would, by its long angle with the floor, seriously contract the already small area of the chapel, the architect, it seemed, had acted upon the hint of Father Mapple, and finished the pulpit without a stairs, substituting a perpendicular side ladder, like those used in mounting a ship from a boat at sea. The wife of a whaling captain had provided the chapel with a handsome pair of red worsted man-ropes for this ladder, which, being itself nicely headed, and stained with a mahogany colour, the whole contrivance, considering what manner of chapel it was, seemed by no means in bad taste. Halting for an instant at the foot of the ladder, and with both hands grasping the ornamental knobs of the man-ropes, Father Mapple cast a look upwards, and then with a truly sailor-like but still reverential dexterity, hand over hand, mounted the steps as if ascending the main-top of his vessel.

The perpendicular parts of this side ladder, as is usually the case with swinging ones, were of cloth-covered rope, only the rounds were of wood, so that at every step there was a joint. At my first glimpse of the pulpit, it had not escaped me that however convenient for a ship, these joints in the present instance seemed unnecessary. For I was not prepared to see Father Mapple after gaining the height, slowly turn round, and stooping over the pulpit, deliberately drag up the ladder step by step, till the whole was deposited within, leaving him impregnable in his little Quebec.

I pondered some time without fully comprehending the reason for this. Father Mapple enjoyed such a wide reputation for sincerity and sanctity, that I could not suspect him of courting notoriety by any mere tricks of the stage. No, thought I, there must be some sober reason for this thing; furthermore, it must symbolize something unseen. Can it be, then, that by that act of physical isolation, he signifies his spiritual withdrawal for the time, from all outward worldly ties and connexions? Yes, for replenished with the meat and wine of the word, to the faithful man of God, this pulpit, I see, is a self-containing stronghold—a lofty Ehrenbreitstein, with a perennial well of water within the walls.

But the side ladder was not the only strange feature of the place, borrowed from the chaplain’s former sea-farings. Between the marble cenotaphs on either hand of the pulpit, the wall which formed its back was adorned with a large painting representing a gallant ship beating against a terrible storm off a lee coast of black rocks and snowy breakers. But high above the flying scud and dark-rolling clouds, there floated a little isle of sunlight, from which beamed forth an angel’s face; and this bright face shed a distinct spot of radiance upon the ship’s tossed deck, something like that silver plate now inserted into the Victory’s plank where Nelson fell. “Ah, noble ship,” the angel seemed to say, “beat on, beat on, thou noble ship, and bear a hardy helm; for lo! the sun is breaking through; the clouds are rolling off—serenest azure is at hand.”

Nor was the pulpit itself without a trace of the same sea-taste that had achieved the ladder and the picture. Its panelled front was in the likeness of a ship’s bluff bows, and the Holy Bible rested on a projecting piece of scroll work, fashioned after a ship’s fiddle-headed beak.

What could be more full of meaning?—for the pulpit is ever this earth’s foremost part; all the rest comes in its rear; the pulpit leads the world. From thence it is the storm of God’s quick wrath is first descried, and the bow must bear the earliest brunt. From thence it is the God of breezes fair or foul is first invoked for favourable winds. Yes, the world’s a ship on its passage out, and not a voyage complete; and the pulpit is its prow.






CHAPTER 9. The Sermon.
Father Mapple rose, and in a mild voice of unassuming authority ordered the scattered people to condense. “Starboard gangway, there! side away to larboard—larboard gangway to starboard! Midships! midships!”

There was a low rumbling of heavy sea-boots among the benches, and a still slighter shuffling of women’s shoes, and all was quiet again, and every eye on the preacher.

He paused a little; then kneeling in the pulpit’s bows, folded his large brown hands across his chest, uplifted his closed eyes, and offered a prayer so deeply devout that he seemed kneeling and praying at the bottom of the sea.

This ended, in prolonged solemn tones, like the continual tolling of a bell in a ship that is foundering at sea in a fog—in such tones he commenced reading the following hymn; but changing his manner towards the concluding stanzas, burst forth with a pealing exultation and joy—

     “The ribs and terrors in the whale,
     Arched over me a dismal gloom,
     While all God’s sun-lit waves rolled by,
     And lift me deepening down to doom.

     “I saw the opening maw of hell,
     With endless pains and sorrows there;
     Which none but they that feel can tell—
     Oh, I was plunging to despair.

     “In black distress, I called my God,
     When I could scarce believe him mine,
     He bowed his ear to my complaints—
     No more the whale did me confine.

     “With speed he flew to my relief,
     As on a radiant dolphin borne;
     Awful, yet bright, as lightning shone
     The face of my Deliverer God.

     “My song for ever shall record
     That terrible, that joyful hour;
     I give the glory to my God,
     His all the mercy and the power.”
 
Nearly all joined in singing this hymn, which swelled high above the howling of the storm. A brief pause ensued; the preacher slowly turned over the leaves of the Bible, and at last, folding his hand down upon the proper page, said: “Beloved shipmates, clinch the last verse of the first chapter of Jonah—‘And God had prepared a great fish to swallow up Jonah.’”

“Shipmates, this book, containing only four chapters—four yarns—is one of the smallest strands in the mighty cable of the Scriptures. Yet what depths of the soul does Jonah’s deep sealine sound! what a pregnant lesson to us is this prophet! What a noble thing is that canticle in the fish’s belly! How billow-like and boisterously grand! We feel the floods surging over us; we sound with him to the kelpy bottom of the waters; sea-weed and all the slime of the sea is about us! But what is this lesson that the book of Jonah teaches? Shipmates, it is a two-stranded lesson; a lesson to us all as sinful men, and a lesson to me as a pilot of the living God. As sinful men, it is a lesson to us all, because it is a story of the sin, hard-heartedness, suddenly awakened fears, the swift punishment, repentance, prayers, and finally the deliverance and joy of Jonah. As with all sinners among men, the sin of this son of Amittai was in his wilful disobedience of the command of God—never mind now what that command was, or how conveyed—which he found a hard command. But all the things that God would have us do are hard for us to do—remember that—and hence, he oftener commands us than endeavors to persuade. And if we obey God, we must disobey ourselves; and it is in this disobeying ourselves, wherein the hardness of obeying God consists.

“With this sin of disobedience in him, Jonah still further flouts at God, by seeking to flee from Him. He thinks that a ship made by men will carry him into countries where God does not reign, but only the Captains of this earth. He skulks about the wharves of Joppa, and seeks a ship that’s bound for Tarshish. There lurks, perhaps, a hitherto unheeded meaning here. By all accounts Tarshish could have been no other city than the modern Cadiz. That’s the opinion of learned men. And where is Cadiz, shipmates? Cadiz is in Spain; as far by water, from Joppa, as Jonah could possibly have sailed in those ancient days, when the Atlantic was an almost unknown sea. Because Joppa, the modern Jaffa, shipmates, is on the most easterly coast of the Mediterranean, the Syrian; and Tarshish or Cadiz more than two thousand miles to the westward from that, just outside the Straits of Gibraltar. See ye not then, shipmates, that Jonah sought to flee world-wide from God? Miserable man! Oh! most contemptible and worthy of all scorn; with slouched hat and guilty eye, skulking from his God; prowling among the shipping like a vile burglar hastening to cross the seas. So disordered, self-condemning is his look, that had there been policemen in those days, Jonah, on the mere suspicion of something wrong, had been arrested ere he touched a deck. How plainly he’s a fugitive! no baggage, not a hat-box, valise, or carpet-bag,—no friends accompany him to the wharf with their adieux. At last, after much dodging search, he finds the Tarshish ship receiving the last items of her cargo; and as he steps on board to see its Captain in the cabin, all the sailors for the moment desist from hoisting in the goods, to mark the stranger’s evil eye. Jonah sees this; but in vain he tries to look all ease and confidence; in vain essays his wretched smile. Strong intuitions of the man assure the mariners he can be no innocent. In their gamesome but still serious way, one whispers to the other—“Jack, he’s robbed a widow;” or, “Joe, do you mark him; he’s a bigamist;” or, “Harry lad, I guess he’s the adulterer that broke jail in old Gomorrah, or belike, one of the missing murderers from Sodom.” Another runs to read the bill that’s stuck against the spile upon the wharf to which the ship is moored, offering five hundred gold coins for the apprehension of a parricide, and containing a description of his person. He reads, and looks from Jonah to the bill; while all his sympathetic shipmates now crowd round Jonah, prepared to lay their hands upon him. Frighted Jonah trembles, and summoning all his boldness to his face, only looks so much the more a coward. He will not confess himself suspected; but that itself is strong suspicion. So he makes the best of it; and when the sailors find him not to be the man that is advertised, they let him pass, and he descends into the cabin.

“‘Who’s there?’ cries the Captain at his busy desk, hurriedly making out his papers for the Customs—‘Who’s there?’ Oh! how that harmless question mangles Jonah! For the instant he almost turns to flee again. But he rallies. ‘I seek a passage in this ship to Tarshish; how soon sail ye, sir?’ Thus far the busy Captain had not looked up to Jonah, though the man now stands before him; but no sooner does he hear that hollow voice, than he darts a scrutinizing glance. ‘We sail with the next coming tide,’ at last he slowly answered, still intently eyeing him. ‘No sooner, sir?’—‘Soon enough for any honest man that goes a passenger.’ Ha! Jonah, that’s another stab. But he swiftly calls away the Captain from that scent. ‘I’ll sail with ye,’—he says,—‘the passage money how much is that?—I’ll pay now.’ For it is particularly written, shipmates, as if it were a thing not to be overlooked in this history, ‘that he paid the fare thereof’ ere the craft did sail. And taken with the context, this is full of meaning.

“Now Jonah’s Captain, shipmates, was one whose discernment detects crime in any, but whose cupidity exposes it only in the penniless. In this world, shipmates, sin that pays its way can travel freely, and without a passport; whereas Virtue, if a pauper, is stopped at all frontiers. So Jonah’s Captain prepares to test the length of Jonah’s purse, ere he judge him openly. He charges him thrice the usual sum; and it’s assented to. Then the Captain knows that Jonah is a fugitive; but at the same time resolves to help a flight that paves its rear with gold. Yet when Jonah fairly takes out his purse, prudent suspicions still molest the Captain. He rings every coin to find a counterfeit. Not a forger, any way, he mutters; and Jonah is put down for his passage. ‘Point out my state-room, Sir,’ says Jonah now, ‘I’m travel-weary; I need sleep.’ ‘Thou lookest like it,’ says the Captain, ‘there’s thy room.’ Jonah enters, and would lock the door, but the lock contains no key. Hearing him foolishly fumbling there, the Captain laughs lowly to himself, and mutters something about the doors of convicts’ cells being never allowed to be locked within. All dressed and dusty as he is, Jonah throws himself into his berth, and finds the little state-room ceiling almost resting on his forehead. The air is close, and Jonah gasps. Then, in that contracted hole, sunk, too, beneath the ship’s water-line, Jonah feels the heralding presentiment of that stifling hour, when the whale shall hold him in the smallest of his bowels’ wards.

“Screwed at its axis against the side, a swinging lamp slightly oscillates in Jonah’s room; and the ship, heeling over towards the wharf with the weight of the last bales received, the lamp, flame and all, though in slight motion, still maintains a permanent obliquity with reference to the room; though, in truth, infallibly straight itself, it but made obvious the false, lying levels among which it hung. The lamp alarms and frightens Jonah; as lying in his berth his tormented eyes roll round the place, and this thus far successful fugitive finds no refuge for his restless glance. But that contradiction in the lamp more and more appals him. The floor, the ceiling, and the side, are all awry. ‘Oh! so my conscience hangs in me!’ he groans, ‘straight upwards, so it burns; but the chambers of my soul are all in crookedness!’

“Like one who after a night of drunken revelry hies to his bed, still reeling, but with conscience yet pricking him, as the plungings of the Roman race-horse but so much the more strike his steel tags into him; as one who in that miserable plight still turns and turns in giddy anguish, praying God for annihilation until the fit be passed; and at last amid the whirl of woe he feels, a deep stupor steals over him, as over the man who bleeds to death, for conscience is the wound, and there’s naught to staunch it; so, after sore wrestlings in his berth, Jonah’s prodigy of ponderous misery drags him drowning down to sleep.

“And now the time of tide has come; the ship casts off her cables; and from the deserted wharf the uncheered ship for Tarshish, all careening, glides to sea. That ship, my friends, was the first of recorded smugglers! the contraband was Jonah. But the sea rebels; he will not bear the wicked burden. A dreadful storm comes on, the ship is like to break. But now when the boatswain calls all hands to lighten her; when boxes, bales, and jars are clattering overboard; when the wind is shrieking, and the men are yelling, and every plank thunders with trampling feet right over Jonah’s head; in all this raging tumult, Jonah sleeps his hideous sleep. He sees no black sky and raging sea, feels not the reeling timbers, and little hears he or heeds he the far rush of the mighty whale, which even now with open mouth is cleaving the seas after him. Aye, shipmates, Jonah was gone down into the sides of the ship—a berth in the cabin as I have taken it, and was fast asleep. But the frightened master comes to him, and shrieks in his dead ear, ‘What meanest thou, O, sleeper! arise!’ Startled from his lethargy by that direful cry, Jonah staggers to his feet, and stumbling to the deck, grasps a shroud, to look out upon the sea. But at that moment he is sprung upon by a panther billow leaping over the bulwarks. Wave after wave thus leaps into the ship, and finding no speedy vent runs roaring fore and aft, till the mariners come nigh to drowning while yet afloat. And ever, as the white moon shows her affrighted face from the steep gullies in the blackness overhead, aghast Jonah sees the rearing bowsprit pointing high upward, but soon beat downward again towards the tormented deep.

“Terrors upon terrors run shouting through his soul. In all his cringing attitudes, the God-fugitive is now too plainly known. The sailors mark him; more and more certain grow their suspicions of him, and at last, fully to test the truth, by referring the whole matter to high Heaven, they fall to casting lots, to see for whose cause this great tempest was upon them. The lot is Jonah’s; that discovered, then how furiously they mob him with their questions. ‘What is thine occupation? Whence comest thou? Thy country? What people? But mark now, my shipmates, the behavior of poor Jonah. The eager mariners but ask him who he is, and where from; whereas, they not only receive an answer to those questions, but likewise another answer to a question not put by them, but the unsolicited answer is forced from Jonah by the hard hand of God that is upon him.

“‘I am a Hebrew,’ he cries—and then—‘I fear the Lord the God of Heaven who hath made the sea and the dry land!’ Fear him, O Jonah? Aye, well mightest thou fear the Lord God then! Straightway, he now goes on to make a full confession; whereupon the mariners became more and more appalled, but still are pitiful. For when Jonah, not yet supplicating God for mercy, since he but too well knew the darkness of his deserts,—when wretched Jonah cries out to them to take him and cast him forth into the sea, for he knew that for his sake this great tempest was upon them; they mercifully turn from him, and seek by other means to save the ship. But all in vain; the indignant gale howls louder; then, with one hand raised invokingly to God, with the other they not unreluctantly lay hold of Jonah.

“And now behold Jonah taken up as an anchor and dropped into the sea; when instantly an oily calmness floats out from the east, and the sea is still, as Jonah carries down the gale with him, leaving smooth water behind. He goes down in the whirling heart of such a masterless commotion that he scarce heeds the moment when he drops seething into the yawning jaws awaiting him; and the whale shoots-to all his ivory teeth, like so many white bolts, upon his prison. Then Jonah prayed unto the Lord out of the fish’s belly. But observe his prayer, and learn a weighty lesson. For sinful as he is, Jonah does not weep and wail for direct deliverance. He feels that his dreadful punishment is just. He leaves all his deliverance to God, contenting himself with this, that spite of all his pains and pangs, he will still look towards His holy temple. And here, shipmates, is true and faithful repentance; not clamorous for pardon, but grateful for punishment. And how pleasing to God was this conduct in Jonah, is shown in the eventual deliverance of him from the sea and the whale. Shipmates, I do not place Jonah before you to be copied for his sin but I do place him before you as a model for repentance. Sin not; but if you do, take heed to repent of it like Jonah.”

While he was speaking these words, the howling of the shrieking, slanting storm without seemed to add new power to the preacher, who, when describing Jonah’s sea-storm, seemed tossed by a storm himself. His deep chest heaved as with a ground-swell; his tossed arms seemed the warring elements at work; and the thunders that rolled away from off his swarthy brow, and the light leaping from his eye, made all his simple hearers look on him with a quick fear that was strange to them.

There now came a lull in his look, as he silently turned over the leaves of the Book once more; and, at last, standing motionless, with closed eyes, for the moment, seemed communing with God and himself.

But again he leaned over towards the people, and bowing his head lowly, with an aspect of the deepest yet manliest humility, he spake these words:

“Shipmates, God has laid but one hand upon you; both his hands press upon me. I have read ye by what murky light may be mine the lesson that Jonah teaches to all sinners; and therefore to ye, and still more to me, for I am a greater sinner than ye. And now how gladly would I come down from this mast-head and sit on the hatches there where you sit, and listen as you listen, while some one of you reads me that other and more awful lesson which Jonah teaches to me, as a pilot of the living God. How being an anointed pilot-prophet, or speaker of true things, and bidden by the Lord to sound those unwelcome truths in the ears of a wicked Nineveh, Jonah, appalled at the hostility he should raise, fled from his mission, and sought to escape his duty and his God by taking ship at Joppa. But God is everywhere; Tarshish he never reached. As we have seen, God came upon him in the whale, and swallowed him down to living gulfs of doom, and with swift slantings tore him along ‘into the midst of the seas,’ where the eddying depths sucked him ten thousand fathoms down, and ‘the weeds were wrapped about his head,’ and all the watery world of woe bowled over him. Yet even then beyond the reach of any plummet—‘out of the belly of hell’—when the whale grounded upon the ocean’s utmost bones, even then, God heard the engulphed, repenting prophet when he cried. Then God spake unto the fish; and from the shuddering cold and blackness of the sea, the whale came breeching up towards the warm and pleasant sun, and all the delights of air and earth; and ‘vomited out Jonah upon the dry land;’ when the word of the Lord came a second time; and Jonah, bruised and beaten—his ears, like two sea-shells, still multitudinously murmuring of the ocean—Jonah did the Almighty’s bidding. And what was that, shipmates? To preach the Truth to the face of Falsehood! That was it!

“This, shipmates, this is that other lesson; and woe to that pilot of the living God who slights it. Woe to him whom this world charms from Gospel duty! Woe to him who seeks to pour oil upon the waters when God has brewed them into a gale! Woe to him who seeks to please rather than to appal! Woe to him whose good name is more to him than goodness! Woe to him who, in this world, courts not dishonor! Woe to him who would not be true, even though to be false were salvation! Yea, woe to him who, as the great Pilot Paul has it, while preaching to others is himself a castaway!”

He dropped and fell away from himself for a moment; then lifting his face to them again, showed a deep joy in his eyes, as he cried out with a heavenly enthusiasm,—“But oh! shipmates! on the starboard hand of every woe, there is a sure delight; and higher the top of that delight, than the bottom of the woe is deep. Is not the main-truck higher than the kelson is low? Delight is to him—a far, far upward, and inward delight—who against the proud gods and commodores of this earth, ever stands forth his own inexorable self. Delight is to him whose strong arms yet support him, when the ship of this base treacherous world has gone down beneath him. Delight is to him, who gives no quarter in the truth, and kills, burns, and destroys all sin though he pluck it out from under the robes of Senators and Judges. Delight,—top-gallant delight is to him, who acknowledges no law or lord, but the Lord his God, and is only a patriot to heaven. Delight is to him, whom all the waves of the billows of the seas of the boisterous mob can never shake from this sure Keel of the Ages. And eternal delight and deliciousness will be his, who coming to lay him down, can say with his final breath—O Father!—chiefly known to me by Thy rod—mortal or immortal, here I die. I have striven to be Thine, more than to be this world’s, or mine own. Yet this is nothing: I leave eternity to Thee; for what is man that he should live out the lifetime of his God?”

He said no more, but slowly waving a benediction, covered his face with his hands, and so remained kneeling, till all the people had departed, and he was left alone in the place.






CHAPTER 10. A Bosom Friend.
Returning to the Spouter-Inn from the Chapel, I found Queequeg there quite alone; he having left the Chapel before the benediction some time. He was sitting on a bench before the fire, with his feet on the stove hearth, and in one hand was holding close up to his face that little negro idol of his; peering hard into its face, and with a jack-knife gently whittling away at its nose, meanwhile humming to himself in his heathenish way.

But being now interrupted, he put up the image; and pretty soon, going to the table, took up a large book there, and placing it on his lap began counting the pages with deliberate regularity; at every fiftieth page—as I fancied—stopping a moment, looking vacantly around him, and giving utterance to a long-drawn gurgling whistle of astonishment. He would then begin again at the next fifty; seeming to commence at number one each time, as though he could not count more than fifty, and it was only by such a large number of fifties being found together, that his astonishment at the multitude of pages was excited.

With much interest I sat watching him. Savage though he was, and hideously marred about the face—at least to my taste—his countenance yet had a something in it which was by no means disagreeable. You cannot hide the soul. Through all his unearthly tattooings, I thought I saw the traces of a simple honest heart; and in his large, deep eyes, fiery black and bold, there seemed tokens of a spirit that would dare a thousand devils. And besides all this, there was a certain lofty bearing about the Pagan, which even his uncouthness could not altogether maim. He looked like a man who had never cringed and never had had a creditor. Whether it was, too, that his head being shaved, his forehead was drawn out in freer and brighter relief, and looked more expansive than it otherwise would, this I will not venture to decide; but certain it was his head was phrenologically an excellent one. It may seem ridiculous, but it reminded me of General Washington’s head, as seen in the popular busts of him. It had the same long regularly graded retreating slope from above the brows, which were likewise very projecting, like two long promontories thickly wooded on top. Queequeg was George Washington cannibalistically developed.

Whilst I was thus closely scanning him, half-pretending meanwhile to be looking out at the storm from the casement, he never heeded my presence, never troubled himself with so much as a single glance; but appeared wholly occupied with counting the pages of the marvellous book. Considering how sociably we had been sleeping together the night previous, and especially considering the affectionate arm I had found thrown over me upon waking in the morning, I thought this indifference of his very strange. But savages are strange beings; at times you do not know exactly how to take them. At first they are overawing; their calm self-collectedness of simplicity seems a Socratic wisdom. I had noticed also that Queequeg never consorted at all, or but very little, with the other seamen in the inn. He made no advances whatever; appeared to have no desire to enlarge the circle of his acquaintances. All this struck me as mighty singular; yet, upon second thoughts, there was something almost sublime in it. Here was a man some twenty thousand miles from home, by the way of Cape Horn, that is—which was the only way he could get there—thrown among people as strange to him as though he were in the planet Jupiter; and yet he seemed entirely at his ease; preserving the utmost serenity; content with his own companionship; always equal to himself. Surely this was a touch of fine philosophy; though no doubt he had never heard there was such a thing as that. But, perhaps, to be true philosophers, we mortals should not be conscious of so living or so striving. So soon as I hear that such or such a man gives himself out for a philosopher, I conclude that, like the dyspeptic old woman, he must have “broken his digester.”

As I sat there in that now lonely room; the fire burning low, in that mild stage when, after its first intensity has warmed the air, it then only glows to be looked at; the evening shades and phantoms gathering round the casements, and peering in upon us silent, solitary twain; the storm booming without in solemn swells; I began to be sensible of strange feelings. I felt a melting in me. No more my splintered heart and maddened hand were turned against the wolfish world. This soothing savage had redeemed it. There he sat, his very indifference speaking a nature in which there lurked no civilized hypocrisies and bland deceits. Wild he was; a very sight of sights to see; yet I began to feel myself mysteriously drawn towards him. And those same things that would have repelled most others, they were the very magnets that thus drew me. I’ll try a pagan friend, thought I, since Christian kindness has proved but hollow courtesy. I drew my bench near him, and made some friendly signs and hints, doing my best to talk with him meanwhile. At first he little noticed these advances; but presently, upon my referring to his last night’s hospitalities, he made out to ask me whether we were again to be bedfellows. I told him yes; whereat I thought he looked pleased, perhaps a little complimented.

We then turned over the book together, and I endeavored to explain to him the purpose of the printing, and the meaning of the few pictures that were in it. Thus I soon engaged his interest; and from that we went to jabbering the best we could about the various outer sights to be seen in this famous town. Soon I proposed a social smoke; and, producing his pouch and tomahawk, he quietly offered me a puff. And then we sat exchanging puffs from that wild pipe of his, and keeping it regularly passing between us.

If there yet lurked any ice of indifference towards me in the Pagan’s breast, this pleasant, genial smoke we had, soon thawed it out, and left us cronies. He seemed to take to me quite as naturally and unbiddenly as I to him; and when our smoke was over, he pressed his forehead against mine, clasped me round the waist, and said that henceforth we were married; meaning, in his country’s phrase, that we were bosom friends; he would gladly die for me, if need should be. In a countryman, this sudden flame of friendship would have seemed far too premature, a thing to be much distrusted; but in this simple savage those old rules would not apply.

After supper, and another social chat and smoke, we went to our room together. He made me a present of his embalmed head; took out his enormous tobacco wallet, and groping under the tobacco, drew out some thirty dollars in silver; then spreading them on the table, and mechanically dividing them into two equal portions, pushed one of them towards me, and said it was mine. I was going to remonstrate; but he silenced me by pouring them into my trowsers’ pockets. I let them stay. He then went about his evening prayers, took out his idol, and removed the paper fireboard. By certain signs and symptoms, I thought he seemed anxious for me to join him; but well knowing what was to follow, I deliberated a moment whether, in case he invited me, I would comply or otherwise.

I was a good Christian; born and bred in the bosom of the infallible Presbyterian Church. How then could I unite with this wild idolator in worshipping his piece of wood? But what is worship? thought I. Do you suppose now, Ishmael, that the magnanimous God of heaven and earth—pagans and all included—can possibly be jealous of an insignificant bit of black wood? Impossible! But what is worship?—to do the will of God—that is worship. And what is the will of God?—to do to my fellow man what I would have my fellow man to do to me—that is the will of God. Now, Queequeg is my fellow man. And what do I wish that this Queequeg would do to me? Why, unite with me in my particular Presbyterian form of worship. Consequently, I must then unite with him in his; ergo, I must turn idolator. So I kindled the shavings; helped prop up the innocent little idol; offered him burnt biscuit with Queequeg; salamed before him twice or thrice; kissed his nose; and that done, we undressed and went to bed, at peace with our own consciences and all the world. But we did not go to sleep without some little chat.

How it is I know not; but there is no place like a bed for confidential disclosures between friends. Man and wife, they say, there open the very bottom of their souls to each other; and some old couples often lie and chat over old times till nearly morning. Thus, then, in our hearts’ honeymoon, lay I and Queequeg—a cosy, loving pair.






CHAPTER 11. Nightgown.
We had lain thus in bed, chatting and napping at short intervals, and Queequeg now and then affectionately throwing his brown tattooed legs over mine, and then drawing them back; so entirely sociable and free and easy were we; when, at last, by reason of our confabulations, what little nappishness remained in us altogether departed, and we felt like getting up again, though day-break was yet some way down the future.

Yes, we became very wakeful; so much so that our recumbent position began to grow wearisome, and by little and little we found ourselves sitting up; the clothes well tucked around us, leaning against the head-board with our four knees drawn up close together, and our two noses bending over them, as if our kneepans were warming-pans. We felt very nice and snug, the more so since it was so chilly out of doors; indeed out of bed-clothes too, seeing that there was no fire in the room. The more so, I say, because truly to enjoy bodily warmth, some small part of you must be cold, for there is no quality in this world that is not what it is merely by contrast. Nothing exists in itself. If you flatter yourself that you are all over comfortable, and have been so a long time, then you cannot be said to be comfortable any more. But if, like Queequeg and me in the bed, the tip of your nose or the crown of your head be slightly chilled, why then, indeed, in the general consciousness you feel most delightfully and unmistakably warm. For this reason a sleeping apartment should never be furnished with a fire, which is one of the luxurious discomforts of the rich. For the height of this sort of deliciousness is to have nothing but the blanket between you and your snugness and the cold of the outer air. Then there you lie like the one warm spark in the heart of an arctic crystal.

We had been sitting in this crouching manner for some time, when all at once I thought I would open my eyes; for when between sheets, whether by day or by night, and whether asleep or awake, I have a way of always keeping my eyes shut, in order the more to concentrate the snugness of being in bed. Because no man can ever feel his own identity aright except his eyes be closed; as if darkness were indeed the proper element of our essences, though light be more congenial to our clayey part. Upon opening my eyes then, and coming out of my own pleasant and self-created darkness into the imposed and coarse outer gloom of the unilluminated twelve-o’clock-at-night, I experienced a disagreeable revulsion. Nor did I at all object to the hint from Queequeg that perhaps it were best to strike a light, seeing that we were so wide awake; and besides he felt a strong desire to have a few quiet puffs from his Tomahawk. Be it said, that though I had felt such a strong repugnance to his smoking in the bed the night before, yet see how elastic our stiff prejudices grow when love once comes to bend them. For now I liked nothing better than to have Queequeg smoking by me, even in bed, because he seemed to be full of such serene household joy then. I no more felt unduly concerned for the landlord’s policy of insurance. I was only alive to the condensed confidential comfortableness of sharing a pipe and a blanket with a real friend. With our shaggy jackets drawn about our shoulders, we now passed the Tomahawk from one to the other, till slowly there grew over us a blue hanging tester of smoke, illuminated by the flame of the new-lit lamp.

Whether it was that this undulating tester rolled the savage away to far distant scenes, I know not, but he now spoke of his native island; and, eager to hear his history, I begged him to go on and tell it. He gladly complied. Though at the time I but ill comprehended not a few of his words, yet subsequent disclosures, when I had become more familiar with his broken phraseology, now enable me to present the whole story such as it may prove in the mere skeleton I give.






CHAPTER 12. Biographical.
Queequeg was a native of Rokovoko, an island far away to the West and South. It is not down in any map; true places never are.

When a new-hatched savage running wild about his native woodlands in a grass clout, followed by the nibbling goats, as if he were a green sapling; even then, in Queequeg’s ambitious soul, lurked a strong desire to see something more of Christendom than a specimen whaler or two. His father was a High Chief, a King; his uncle a High Priest; and on the maternal side he boasted aunts who were the wives of unconquerable warriors. There was excellent blood in his veins—royal stuff; though sadly vitiated, I fear, by the cannibal propensity he nourished in his untutored youth.

A Sag Harbor ship visited his father’s bay, and Queequeg sought a passage to Christian lands. But the ship, having her full complement of seamen, spurned his suit; and not all the King his father’s influence could prevail. But Queequeg vowed a vow. Alone in his canoe, he paddled off to a distant strait, which he knew the ship must pass through when she quitted the island. On one side was a coral reef; on the other a low tongue of land, covered with mangrove thickets that grew out into the water. Hiding his canoe, still afloat, among these thickets, with its prow seaward, he sat down in the stern, paddle low in hand; and when the ship was gliding by, like a flash he darted out; gained her side; with one backward dash of his foot capsized and sank his canoe; climbed up the chains; and throwing himself at full length upon the deck, grappled a ring-bolt there, and swore not to let it go, though hacked in pieces.

In vain the captain threatened to throw him overboard; suspended a cutlass over his naked wrists; Queequeg was the son of a King, and Queequeg budged not. Struck by his desperate dauntlessness, and his wild desire to visit Christendom, the captain at last relented, and told him he might make himself at home. But this fine young savage—this sea Prince of Wales, never saw the Captain’s cabin. They put him down among the sailors, and made a whaleman of him. But like Czar Peter content to toil in the shipyards of foreign cities, Queequeg disdained no seeming ignominy, if thereby he might happily gain the power of enlightening his untutored countrymen. For at bottom—so he told me—he was actuated by a profound desire to learn among the Christians, the arts whereby to make his people still happier than they were; and more than that, still better than they were. But, alas! the practices of whalemen soon convinced him that even Christians could be both miserable and wicked; infinitely more so, than all his father’s heathens. Arrived at last in old Sag Harbor; and seeing what the sailors did there; and then going on to Nantucket, and seeing how they spent their wages in that place also, poor Queequeg gave it up for lost. Thought he, it’s a wicked world in all meridians; I’ll die a pagan.

And thus an old idolator at heart, he yet lived among these Christians, wore their clothes, and tried to talk their gibberish. Hence the queer ways about him, though now some time from home.

By hints, I asked him whether he did not propose going back, and having a coronation; since he might now consider his father dead and gone, he being very old and feeble at the last accounts. He answered no, not yet; and added that he was fearful Christianity, or rather Christians, had unfitted him for ascending the pure and undefiled throne of thirty pagan Kings before him. But by and by, he said, he would return,—as soon as he felt himself baptized again. For the nonce, however, he proposed to sail about, and sow his wild oats in all four oceans. They had made a harpooneer of him, and that barbed iron was in lieu of a sceptre now.

I asked him what might be his immediate purpose, touching his future movements. He answered, to go to sea again, in his old vocation. Upon this, I told him that whaling was my own design, and informed him of my intention to sail out of Nantucket, as being the most promising port for an adventurous whaleman to embark from. He at once resolved to accompany me to that island, ship aboard the same vessel, get into the same watch, the same boat, the same mess with me, in short to share my every hap; with both my hands in his, boldly dip into the Potluck of both worlds. To all this I joyously assented; for besides the affection I now felt for Queequeg, he was an experienced harpooneer, and as such, could not fail to be of great usefulness to one, who, like me, was wholly ignorant of the mysteries of whaling, though well acquainted with the sea, as known to merchant seamen.

His story being ended with his pipe’s last dying puff, Queequeg embraced me, pressed his forehead against mine, and blowing out the light, we rolled over from each other, this way and that, and very soon were sleeping.






CHAPTER 13. Wheelbarrow.
Next morning, Monday, after disposing of the embalmed head to a barber, for a block, I settled my own and comrade’s bill; using, however, my comrade’s money. The grinning landlord, as well as the boarders, seemed amazingly tickled at the sudden friendship which had sprung up between me and Queequeg—especially as Peter Coffin’s cock and bull stories about him had previously so much alarmed me concerning the very person whom I now companied with.

We borrowed a wheelbarrow, and embarking our things, including my own poor carpet-bag, and Queequeg’s canvas sack and hammock, away we went down to “the Moss,” the little Nantucket packet schooner moored at the wharf. As we were going along the people stared; not at Queequeg so much—for they were used to seeing cannibals like him in their streets,—but at seeing him and me upon such confidential terms. But we heeded them not, going along wheeling the barrow by turns, and Queequeg now and then stopping to adjust the sheath on his harpoon barbs. I asked him why he carried such a troublesome thing with him ashore, and whether all whaling ships did not find their own harpoons. To this, in substance, he replied, that though what I hinted was true enough, yet he had a particular affection for his own harpoon, because it was of assured stuff, well tried in many a mortal combat, and deeply intimate with the hearts of whales. In short, like many inland reapers and mowers, who go into the farmers’ meadows armed with their own scythes—though in no wise obliged to furnish them—even so, Queequeg, for his own private reasons, preferred his own harpoon.

Shifting the barrow from my hand to his, he told me a funny story about the first wheelbarrow he had ever seen. It was in Sag Harbor. The owners of his ship, it seems, had lent him one, in which to carry his heavy chest to his boarding house. Not to seem ignorant about the thing—though in truth he was entirely so, concerning the precise way in which to manage the barrow—Queequeg puts his chest upon it; lashes it fast; and then shoulders the barrow and marches up the wharf. “Why,” said I, “Queequeg, you might have known better than that, one would think. Didn’t the people laugh?”

Upon this, he told me another story. The people of his island of Rokovoko, it seems, at their wedding feasts express the fragrant water of young cocoanuts into a large stained calabash like a punchbowl; and this punchbowl always forms the great central ornament on the braided mat where the feast is held. Now a certain grand merchant ship once touched at Rokovoko, and its commander—from all accounts, a very stately punctilious gentleman, at least for a sea captain—this commander was invited to the wedding feast of Queequeg’s sister, a pretty young princess just turned of ten. Well; when all the wedding guests were assembled at the bride’s bamboo cottage, this Captain marches in, and being assigned the post of honor, placed himself over against the punchbowl, and between the High Priest and his majesty the King, Queequeg’s father. Grace being said,—for those people have their grace as well as we—though Queequeg told me that unlike us, who at such times look downwards to our platters, they, on the contrary, copying the ducks, glance upwards to the great Giver of all feasts—Grace, I say, being said, the High Priest opens the banquet by the immemorial ceremony of the island; that is, dipping his consecrated and consecrating fingers into the bowl before the blessed beverage circulates. Seeing himself placed next the Priest, and noting the ceremony, and thinking himself—being Captain of a ship—as having plain precedence over a mere island King, especially in the King’s own house—the Captain coolly proceeds to wash his hands in the punchbowl;—taking it I suppose for a huge finger-glass. “Now,” said Queequeg, “what you tink now?—Didn’t our people laugh?”

At last, passage paid, and luggage safe, we stood on board the schooner. Hoisting sail, it glided down the Acushnet river. On one side, New Bedford rose in terraces of streets, their ice-covered trees all glittering in the clear, cold air. Huge hills and mountains of casks on casks were piled upon her wharves, and side by side the world-wandering whale ships lay silent and safely moored at last; while from others came a sound of carpenters and coopers, with blended noises of fires and forges to melt the pitch, all betokening that new cruises were on the start; that one most perilous and long voyage ended, only begins a second; and a second ended, only begins a third, and so on, for ever and for aye. Such is the endlessness, yea, the intolerableness of all earthly effort.

Gaining the more open water, the bracing breeze waxed fresh; the little Moss tossed the quick foam from her bows, as a young colt his snortings. How I snuffed that Tartar air!—how I spurned that turnpike earth!—that common highway all over dented with the marks of slavish heels and hoofs; and turned me to admire the magnanimity of the sea which will permit no records.

At the same foam-fountain, Queequeg seemed to drink and reel with me. His dusky nostrils swelled apart; he showed his filed and pointed teeth. On, on we flew; and our offing gained, the Moss did homage to the blast; ducked and dived her bows as a slave before the Sultan. Sideways leaning, we sideways darted; every ropeyarn tingling like a wire; the two tall masts buckling like Indian canes in land tornadoes. So full of this reeling scene were we, as we stood by the plunging bowsprit, that for some time we did not notice the jeering glances of the passengers, a lubber-like assembly, who marvelled that two fellow beings should be so companionable; as though a white man were anything more dignified than a whitewashed negro. But there were some boobies and bumpkins there, who, by their intense greenness, must have come from the heart and centre of all verdure. Queequeg caught one of these young saplings mimicking him behind his back. I thought the bumpkin’s hour of doom was come. Dropping his harpoon, the brawny savage caught him in his arms, and by an almost miraculous dexterity and strength, sent him high up bodily into the air; then slightly tapping his stern in mid-somerset, the fellow landed with bursting lungs upon his feet, while Queequeg, turning his back upon him, lighted his tomahawk pipe and passed it to me for a puff.

“Capting! Capting!” yelled the bumpkin, running towards that officer; “Capting, Capting, here’s the devil.”

“Hallo, you sir,” cried the Captain, a gaunt rib of the sea, stalking up to Queequeg, “what in thunder do you mean by that? Don’t you know you might have killed that chap?”

“What him say?” said Queequeg, as he mildly turned to me.

“He say,” said I, “that you came near kill-e that man there,” pointing to the still shivering greenhorn.

“Kill-e,” cried Queequeg, twisting his tattooed face into an unearthly expression of disdain, “ah! him bevy small-e fish-e; Queequeg no kill-e so small-e fish-e; Queequeg kill-e big whale!”

“Look you,” roared the Captain, “I’ll kill-e you, you cannibal, if you try any more of your tricks aboard here; so mind your eye.”

But it so happened just then, that it was high time for the Captain to mind his own eye. The prodigious strain upon the main-sail had parted the weather-sheet, and the tremendous boom was now flying from side to side, completely sweeping the entire after part of the deck. The poor fellow whom Queequeg had handled so roughly, was swept overboard; all hands were in a panic; and to attempt snatching at the boom to stay it, seemed madness. It flew from right to left, and back again, almost in one ticking of a watch, and every instant seemed on the point of snapping into splinters. Nothing was done, and nothing seemed capable of being done; those on deck rushed towards the bows, and stood eyeing the boom as if it were the lower jaw of an exasperated whale. In the midst of this consternation, Queequeg dropped deftly to his knees, and crawling under the path of the boom, whipped hold of a rope, secured one end to the bulwarks, and then flinging the other like a lasso, caught it round the boom as it swept over his head, and at the next jerk, the spar was that way trapped, and all was safe. The schooner was run into the wind, and while the hands were clearing away the stern boat, Queequeg, stripped to the waist, darted from the side with a long living arc of a leap. For three minutes or more he was seen swimming like a dog, throwing his long arms straight out before him, and by turns revealing his brawny shoulders through the freezing foam. I looked at the grand and glorious fellow, but saw no one to be saved. The greenhorn had gone down. Shooting himself perpendicularly from the water, Queequeg, now took an instant’s glance around him, and seeming to see just how matters were, dived down and disappeared. A few minutes more, and he rose again, one arm still striking out, and with the other dragging a lifeless form. The boat soon picked them up. The poor bumpkin was restored. All hands voted Queequeg a noble trump; the captain begged his pardon. From that hour I clove to Queequeg like a barnacle; yea, till poor Queequeg took his last long dive.

Was there ever such unconsciousness? He did not seem to think that he at all deserved a medal from the Humane and Magnanimous Societies. He only asked for water—fresh water—something to wipe the brine off; that done, he put on dry clothes, lighted his pipe, and leaning against the bulwarks, and mildly eyeing those around him, seemed to be saying to himself—“It’s a mutual, joint-stock world, in all meridians. We cannibals must help these Christians.”






CHAPTER 14. Nantucket.
Nothing more happened on the passage worthy the mentioning; so, after a fine run, we safely arrived in Nantucket.

Nantucket! Take out your map and look at it. See what a real corner of the world it occupies; how it stands there, away off shore, more lonely than the Eddystone lighthouse. Look at it—a mere hillock, and elbow of sand; all beach, without a background. There is more sand there than you would use in twenty years as a substitute for blotting paper. Some gamesome wights will tell you that they have to plant weeds there, they don’t grow naturally; that they import Canada thistles; that they have to send beyond seas for a spile to stop a leak in an oil cask; that pieces of wood in Nantucket are carried about like bits of the true cross in Rome; that people there plant toadstools before their houses, to get under the shade in summer time; that one blade of grass makes an oasis, three blades in a day’s walk a prairie; that they wear quicksand shoes, something like Laplander snow-shoes; that they are so shut up, belted about, every way inclosed, surrounded, and made an utter island of by the ocean, that to their very chairs and tables small clams will sometimes be found adhering, as to the backs of sea turtles. But these extravaganzas only show that Nantucket is no Illinois.

Look now at the wondrous traditional story of how this island was settled by the red-men. Thus goes the legend. In olden times an eagle swooped down upon the New England coast, and carried off an infant Indian in his talons. With loud lament the parents saw their child borne out of sight over the wide waters. They resolved to follow in the same direction. Setting out in their canoes, after a perilous passage they discovered the island, and there they found an empty ivory casket,—the poor little Indian’s skeleton.

What wonder, then, that these Nantucketers, born on a beach, should take to the sea for a livelihood! They first caught crabs and quohogs in the sand; grown bolder, they waded out with nets for mackerel; more experienced, they pushed off in boats and captured cod; and at last, launching a navy of great ships on the sea, explored this watery world; put an incessant belt of circumnavigations round it; peeped in at Behring’s Straits; and in all seasons and all oceans declared everlasting war with the mightiest animated mass that has survived the flood; most monstrous and most mountainous! That Himmalehan, salt-sea Mastodon, clothed with such portentousness of unconscious power, that his very panics are more to be dreaded than his most fearless and malicious assaults!

And thus have these naked Nantucketers, these sea hermits, issuing from their ant-hill in the sea, overrun and conquered the watery world like so many Alexanders; parcelling out among them the Atlantic, Pacific, and Indian oceans, as the three pirate powers did Poland. Let America add Mexico to Texas, and pile Cuba upon Canada; let the English overswarm all India, and hang out their blazing banner from the sun; two thirds of this terraqueous globe are the Nantucketer’s. For the sea is his; he owns it, as Emperors own empires; other seamen having but a right of way through it. Merchant ships are but extension bridges; armed ones but floating forts; even pirates and privateers, though following the sea as highwaymen the road, they but plunder other ships, other fragments of the land like themselves, without seeking to draw their living from the bottomless deep itself. The Nantucketer, he alone resides and riots on the sea; he alone, in Bible language, goes down to it in ships; to and fro ploughing it as his own special plantation. There is his home; there lies his business, which a Noah’s flood would not interrupt, though it overwhelmed all the millions in China. He lives on the sea, as prairie cocks in the prairie; he hides among the waves, he climbs them as chamois hunters climb the Alps. For years he knows not the land; so that when he comes to it at last, it smells like another world, more strangely than the moon would to an Earthsman. With the landless gull, that at sunset folds her wings and is rocked to sleep between billows; so at nightfall, the Nantucketer, out of sight of land, furls his sails, and lays him to his rest, while under his very pillow rush herds of walruses and whales.






CHAPTER 15. Chowder.
It was quite late in the evening when the little Moss came snugly to anchor, and Queequeg and I went ashore; so we could attend to no business that day, at least none but a supper and a bed. The landlord of the Spouter-Inn had recommended us to his cousin Hosea Hussey of the Try Pots, whom he asserted to be the proprietor of one of the best kept hotels in all Nantucket, and moreover he had assured us that Cousin Hosea, as he called him, was famous for his chowders. In short, he plainly hinted that we could not possibly do better than try pot-luck at the Try Pots. But the directions he had given us about keeping a yellow warehouse on our starboard hand till we opened a white church to the larboard, and then keeping that on the larboard hand till we made a corner three points to the starboard, and that done, then ask the first man we met where the place was: these crooked directions of his very much puzzled us at first, especially as, at the outset, Queequeg insisted that the yellow warehouse—our first point of departure—must be left on the larboard hand, whereas I had understood Peter Coffin to say it was on the starboard. However, by dint of beating about a little in the dark, and now and then knocking up a peaceable inhabitant to inquire the way, we at last came to something which there was no mistaking.

Two enormous wooden pots painted black, and suspended by asses’ ears, swung from the cross-trees of an old top-mast, planted in front of an old doorway. The horns of the cross-trees were sawed off on the other side, so that this old top-mast looked not a little like a gallows. Perhaps I was over sensitive to such impressions at the time, but I could not help staring at this gallows with a vague misgiving. A sort of crick was in my neck as I gazed up to the two remaining horns; yes, two of them, one for Queequeg, and one for me. It’s ominous, thinks I. A Coffin my Innkeeper upon landing in my first whaling port; tombstones staring at me in the whalemen’s chapel; and here a gallows! and a pair of prodigious black pots too! Are these last throwing out oblique hints touching Tophet?

I was called from these reflections by the sight of a freckled woman with yellow hair and a yellow gown, standing in the porch of the inn, under a dull red lamp swinging there, that looked much like an injured eye, and carrying on a brisk scolding with a man in a purple woollen shirt.

“Get along with ye,” said she to the man, “or I’ll be combing ye!”

“Come on, Queequeg,” said I, “all right. There’s Mrs. Hussey.”

And so it turned out; Mr. Hosea Hussey being from home, but leaving Mrs. Hussey entirely competent to attend to all his affairs. Upon making known our desires for a supper and a bed, Mrs. Hussey, postponing further scolding for the present, ushered us into a little room, and seating us at a table spread with the relics of a recently concluded repast, turned round to us and said—“Clam or Cod?”

“What’s that about Cods, ma’am?” said I, with much politeness.

“Clam or Cod?” she repeated.

“A clam for supper? a cold clam; is that what you mean, Mrs. Hussey?” says I, “but that’s a rather cold and clammy reception in the winter time, ain’t it, Mrs. Hussey?”

But being in a great hurry to resume scolding the man in the purple Shirt, who was waiting for it in the entry, and seeming to hear nothing but the word “clam,” Mrs. Hussey hurried towards an open door leading to the kitchen, and bawling out “clam for two,” disappeared.

“Queequeg,” said I, “do you think that we can make out a supper for us both on one clam?”

However, a warm savory steam from the kitchen served to belie the apparently cheerless prospect before us. But when that smoking chowder came in, the mystery was delightfully explained. Oh, sweet friends! hearken to me. It was made of small juicy clams, scarcely bigger than hazel nuts, mixed with pounded ship biscuit, and salted pork cut up into little flakes; the whole enriched with butter, and plentifully seasoned with pepper and salt. Our appetites being sharpened by the frosty voyage, and in particular, Queequeg seeing his favourite fishing food before him, and the chowder being surpassingly excellent, we despatched it with great expedition: when leaning back a moment and bethinking me of Mrs. Hussey’s clam and cod announcement, I thought I would try a little experiment. Stepping to the kitchen door, I uttered the word “cod” with great emphasis, and resumed my seat. In a few moments the savoury steam came forth again, but with a different flavor, and in good time a fine cod-chowder was placed before us.

We resumed business; and while plying our spoons in the bowl, thinks I to myself, I wonder now if this here has any effect on the head? What’s that stultifying saying about chowder-headed people? “But look, Queequeg, ain’t that a live eel in your bowl? Where’s your harpoon?”

Fishiest of all fishy places was the Try Pots, which well deserved its name; for the pots there were always boiling chowders. Chowder for breakfast, and chowder for dinner, and chowder for supper, till you began to look for fish-bones coming through your clothes. The area before the house was paved with clam-shells. Mrs. Hussey wore a polished necklace of codfish vertebra; and Hosea Hussey had his account books bound in superior old shark-skin. There was a fishy flavor to the milk, too, which I could not at all account for, till one morning happening to take a stroll along the beach among some fishermen’s boats, I saw Hosea’s brindled cow feeding on fish remnants, and marching along the sand with each foot in a cod’s decapitated head, looking very slip-shod, I assure ye.

Supper concluded, we received a lamp, and directions from Mrs. Hussey concerning the nearest way to bed; but, as Queequeg was about to precede me up the stairs, the lady reached forth her arm, and demanded his harpoon; she allowed no harpoon in her chambers. “Why not?” said I; “every true whaleman sleeps with his harpoon—but why not?” “Because it’s dangerous,” says she. “Ever since young Stiggs coming from that unfort’nt v’y’ge of his, when he was gone four years and a half, with only three barrels of ile, was found dead in my first floor back, with his harpoon in his side; ever since then I allow no boarders to take sich dangerous weepons in their rooms at night. So, Mr. Queequeg” (for she had learned his name), “I will just take this here iron, and keep it for you till morning. But the chowder; clam or cod to-morrow for breakfast, men?”

“Both,” says I; “and let’s have a couple of smoked herring by way of variety.”






CHAPTER 16. The Ship.
In bed we concocted our plans for the morrow. But to my surprise and no small concern, Queequeg now gave me to understand, that he had been diligently consulting Yojo—the name of his black little god—and Yojo had told him two or three times over, and strongly insisted upon it everyway, that instead of our going together among the whaling-fleet in harbor, and in concert selecting our craft; instead of this, I say, Yojo earnestly enjoined that the selection of the ship should rest wholly with me, inasmuch as Yojo purposed befriending us; and, in order to do so, had already pitched upon a vessel, which, if left to myself, I, Ishmael, should infallibly light upon, for all the world as though it had turned out by chance; and in that vessel I must immediately ship myself, for the present irrespective of Queequeg.

I have forgotten to mention that, in many things, Queequeg placed great confidence in the excellence of Yojo’s judgment and surprising forecast of things; and cherished Yojo with considerable esteem, as a rather good sort of god, who perhaps meant well enough upon the whole, but in all cases did not succeed in his benevolent designs.

Now, this plan of Queequeg’s, or rather Yojo’s, touching the selection of our craft; I did not like that plan at all. I had not a little relied upon Queequeg’s sagacity to point out the whaler best fitted to carry us and our fortunes securely. But as all my remonstrances produced no effect upon Queequeg, I was obliged to acquiesce; and accordingly prepared to set about this business with a determined rushing sort of energy and vigor, that should quickly settle that trifling little affair. Next morning early, leaving Queequeg shut up with Yojo in our little bedroom—for it seemed that it was some sort of Lent or Ramadan, or day of fasting, humiliation, and prayer with Queequeg and Yojo that day; how it was I never could find out, for, though I applied myself to it several times, I never could master his liturgies and XXXIX Articles—leaving Queequeg, then, fasting on his tomahawk pipe, and Yojo warming himself at his sacrificial fire of shavings, I sallied out among the shipping. After much prolonged sauntering and many random inquiries, I learnt that there were three ships up for three-years’ voyages—The Devil-dam, the Tit-bit, and the Pequod. Devil-Dam, I do not know the origin of; Tit-bit is obvious; Pequod, you will no doubt remember, was the name of a celebrated tribe of Massachusetts Indians; now extinct as the ancient Medes. I peered and pryed about the Devil-dam; from her, hopped over to the Tit-bit; and finally, going on board the Pequod, looked around her for a moment, and then decided that this was the very ship for us.

You may have seen many a quaint craft in your day, for aught I know;—square-toed luggers; mountainous Japanese junks; butter-box galliots, and what not; but take my word for it, you never saw such a rare old craft as this same rare old Pequod. She was a ship of the old school, rather small if anything; with an old-fashioned claw-footed look about her. Long seasoned and weather-stained in the typhoons and calms of all four oceans, her old hull’s complexion was darkened like a French grenadier’s, who has alike fought in Egypt and Siberia. Her venerable bows looked bearded. Her masts—cut somewhere on the coast of Japan, where her original ones were lost overboard in a gale—her masts stood stiffly up like the spines of the three old kings of Cologne. Her ancient decks were worn and wrinkled, like the pilgrim-worshipped flag-stone in Canterbury Cathedral where Becket bled. But to all these her old antiquities, were added new and marvellous features, pertaining to the wild business that for more than half a century she had followed. Old Captain Peleg, many years her chief-mate, before he commanded another vessel of his own, and now a retired seaman, and one of the principal owners of the Pequod,—this old Peleg, during the term of his chief-mateship, had built upon her original grotesqueness, and inlaid it, all over, with a quaintness both of material and device, unmatched by anything except it be Thorkill-Hake’s carved buckler or bedstead. She was apparelled like any barbaric Ethiopian emperor, his neck heavy with pendants of polished ivory. She was a thing of trophies. A cannibal of a craft, tricking herself forth in the chased bones of her enemies. All round, her unpanelled, open bulwarks were garnished like one continuous jaw, with the long sharp teeth of the sperm whale, inserted there for pins, to fasten her old hempen thews and tendons to. Those thews ran not through base blocks of land wood, but deftly travelled over sheaves of sea-ivory. Scorning a turnstile wheel at her reverend helm, she sported there a tiller; and that tiller was in one mass, curiously carved from the long narrow lower jaw of her hereditary foe. The helmsman who steered by that tiller in a tempest, felt like the Tartar, when he holds back his fiery steed by clutching its jaw. A noble craft, but somehow a most melancholy! All noble things are touched with that.

Now when I looked about the quarter-deck, for some one having authority, in order to propose myself as a candidate for the voyage, at first I saw nobody; but I could not well overlook a strange sort of tent, or rather wigwam, pitched a little behind the main-mast. It seemed only a temporary erection used in port. It was of a conical shape, some ten feet high; consisting of the long, huge slabs of limber black bone taken from the middle and highest part of the jaws of the right-whale. Planted with their broad ends on the deck, a circle of these slabs laced together, mutually sloped towards each other, and at the apex united in a tufted point, where the loose hairy fibres waved to and fro like the top-knot on some old Pottowottamie Sachem’s head. A triangular opening faced towards the bows of the ship, so that the insider commanded a complete view forward.

And half concealed in this queer tenement, I at length found one who by his aspect seemed to have authority; and who, it being noon, and the ship’s work suspended, was now enjoying respite from the burden of command. He was seated on an old-fashioned oaken chair, wriggling all over with curious carving; and the bottom of which was formed of a stout interlacing of the same elastic stuff of which the wigwam was constructed.

There was nothing so very particular, perhaps, about the appearance of the elderly man I saw; he was brown and brawny, like most old seamen, and heavily rolled up in blue pilot-cloth, cut in the Quaker style; only there was a fine and almost microscopic net-work of the minutest wrinkles interlacing round his eyes, which must have arisen from his continual sailings in many hard gales, and always looking to windward;—for this causes the muscles about the eyes to become pursed together. Such eye-wrinkles are very effectual in a scowl.

“Is this the Captain of the Pequod?” said I, advancing to the door of the tent.

“Supposing it be the captain of the Pequod, what dost thou want of him?” he demanded.

“I was thinking of shipping.”

“Thou wast, wast thou? I see thou art no Nantucketer—ever been in a stove boat?”

“No, Sir, I never have.”

“Dost know nothing at all about whaling, I dare say—eh?

“Nothing, Sir; but I have no doubt I shall soon learn. I’ve been several voyages in the merchant service, and I think that—”

“Merchant service be damned. Talk not that lingo to me. Dost see that leg?—I’ll take that leg away from thy stern, if ever thou talkest of the marchant service to me again. Marchant service indeed! I suppose now ye feel considerable proud of having served in those marchant ships. But flukes! man, what makes thee want to go a whaling, eh?—it looks a little suspicious, don’t it, eh?—Hast not been a pirate, hast thou?—Didst not rob thy last Captain, didst thou?—Dost not think of murdering the officers when thou gettest to sea?”

I protested my innocence of these things. I saw that under the mask of these half humorous innuendoes, this old seaman, as an insulated Quakerish Nantucketer, was full of his insular prejudices, and rather distrustful of all aliens, unless they hailed from Cape Cod or the Vineyard.

“But what takes thee a-whaling? I want to know that before I think of shipping ye.”

“Well, sir, I want to see what whaling is. I want to see the world.”

“Want to see what whaling is, eh? Have ye clapped eye on Captain Ahab?”

“Who is Captain Ahab, sir?”

“Aye, aye, I thought so. Captain Ahab is the Captain of this ship.”

“I am mistaken then. I thought I was speaking to the Captain himself.”

“Thou art speaking to Captain Peleg—that’s who ye are speaking to, young man. It belongs to me and Captain Bildad to see the Pequod fitted out for the voyage, and supplied with all her needs, including crew. We are part owners and agents. But as I was going to say, if thou wantest to know what whaling is, as thou tellest ye do, I can put ye in a way of finding it out before ye bind yourself to it, past backing out. Clap eye on Captain Ahab, young man, and thou wilt find that he has only one leg.”

“What do you mean, sir? Was the other one lost by a whale?”

“Lost by a whale! Young man, come nearer to me: it was devoured, chewed up, crunched by the monstrousest parmacetty that ever chipped a boat!—ah, ah!”

I was a little alarmed by his energy, perhaps also a little touched at the hearty grief in his concluding exclamation, but said as calmly as I could, “What you say is no doubt true enough, sir; but how could I know there was any peculiar ferocity in that particular whale, though indeed I might have inferred as much from the simple fact of the accident.”

“Look ye now, young man, thy lungs are a sort of soft, d’ye see; thou dost not talk shark a bit. Sure, ye’ve been to sea before now; sure of that?”

“Sir,” said I, “I thought I told you that I had been four voyages in the merchant—”

“Hard down out of that! Mind what I said about the marchant service—don’t aggravate me—I won’t have it. But let us understand each other. I have given thee a hint about what whaling is; do ye yet feel inclined for it?”

“I do, sir.”

“Very good. Now, art thou the man to pitch a harpoon down a live whale’s throat, and then jump after it? Answer, quick!”

“I am, sir, if it should be positively indispensable to do so; not to be got rid of, that is; which I don’t take to be the fact.”

“Good again. Now then, thou not only wantest to go a-whaling, to find out by experience what whaling is, but ye also want to go in order to see the world? Was not that what ye said? I thought so. Well then, just step forward there, and take a peep over the weather-bow, and then back to me and tell me what ye see there.”

For a moment I stood a little puzzled by this curious request, not knowing exactly how to take it, whether humorously or in earnest. But concentrating all his crow’s feet into one scowl, Captain Peleg started me on the errand.

Going forward and glancing over the weather bow, I perceived that the ship swinging to her anchor with the flood-tide, was now obliquely pointing towards the open ocean. The prospect was unlimited, but exceedingly monotonous and forbidding; not the slightest variety that I could see.

“Well, what’s the report?” said Peleg when I came back; “what did ye see?”

“Not much,” I replied—“nothing but water; considerable horizon though, and there’s a squall coming up, I think.”

“Well, what does thou think then of seeing the world? Do ye wish to go round Cape Horn to see any more of it, eh? Can’t ye see the world where you stand?”

I was a little staggered, but go a-whaling I must, and I would; and the Pequod was as good a ship as any—I thought the best—and all this I now repeated to Peleg. Seeing me so determined, he expressed his willingness to ship me.

“And thou mayest as well sign the papers right off,” he added—“come along with ye.” And so saying, he led the way below deck into the cabin.

Seated on the transom was what seemed to me a most uncommon and surprising figure. It turned out to be Captain Bildad, who along with Captain Peleg was one of the largest owners of the vessel; the other shares, as is sometimes the case in these ports, being held by a crowd of old annuitants; widows, fatherless children, and chancery wards; each owning about the value of a timber head, or a foot of plank, or a nail or two in the ship. People in Nantucket invest their money in whaling vessels, the same way that you do yours in approved state stocks bringing in good interest.

Now, Bildad, like Peleg, and indeed many other Nantucketers, was a Quaker, the island having been originally settled by that sect; and to this day its inhabitants in general retain in an uncommon measure the peculiarities of the Quaker, only variously and anomalously modified by things altogether alien and heterogeneous. For some of these same Quakers are the most sanguinary of all sailors and whale-hunters. They are fighting Quakers; they are Quakers with a vengeance.

So that there are instances among them of men, who, named with Scripture names—a singularly common fashion on the island—and in childhood naturally imbibing the stately dramatic thee and thou of the Quaker idiom; still, from the audacious, daring, and boundless adventure of their subsequent lives, strangely blend with these unoutgrown peculiarities, a thousand bold dashes of character, not unworthy a Scandinavian sea-king, or a poetical Pagan Roman. And when these things unite in a man of greatly superior natural force, with a globular brain and a ponderous heart; who has also by the stillness and seclusion of many long night-watches in the remotest waters, and beneath constellations never seen here at the north, been led to think untraditionally and independently; receiving all nature’s sweet or savage impressions fresh from her own virgin voluntary and confiding breast, and thereby chiefly, but with some help from accidental advantages, to learn a bold and nervous lofty language—that man makes one in a whole nation’s census—a mighty pageant creature, formed for noble tragedies. Nor will it at all detract from him, dramatically regarded, if either by birth or other circumstances, he have what seems a half wilful overruling morbidness at the bottom of his nature. For all men tragically great are made so through a certain morbidness. Be sure of this, O young ambition, all mortal greatness is but disease. But, as yet we have not to do with such an one, but with quite another; and still a man, who, if indeed peculiar, it only results again from another phase of the Quaker, modified by individual circumstances.

Like Captain Peleg, Captain Bildad was a well-to-do, retired whaleman. But unlike Captain Peleg—who cared not a rush for what are called serious things, and indeed deemed those self-same serious things the veriest of all trifles—Captain Bildad had not only been originally educated according to the strictest sect of Nantucket Quakerism, but all his subsequent ocean life, and the sight of many unclad, lovely island creatures, round the Horn—all that had not moved this native born Quaker one single jot, had not so much as altered one angle of his vest. Still, for all this immutableness, was there some lack of common consistency about worthy Captain Bildad. Though refusing, from conscientious scruples, to bear arms against land invaders, yet himself had illimitably invaded the Atlantic and Pacific; and though a sworn foe to human bloodshed, yet had he in his straight-bodied coat, spilled tuns upon tuns of leviathan gore. How now in the contemplative evening of his days, the pious Bildad reconciled these things in the reminiscence, I do not know; but it did not seem to concern him much, and very probably he had long since come to the sage and sensible conclusion that a man’s religion is one thing, and this practical world quite another. This world pays dividends. Rising from a little cabin-boy in short clothes of the drabbest drab, to a harpooneer in a broad shad-bellied waistcoat; from that becoming boat-header, chief-mate, and captain, and finally a ship owner; Bildad, as I hinted before, had concluded his adventurous career by wholly retiring from active life at the goodly age of sixty, and dedicating his remaining days to the quiet receiving of his well-earned income.

Now, Bildad, I am sorry to say, had the reputation of being an incorrigible old hunks, and in his sea-going days, a bitter, hard task-master. They told me in Nantucket, though it certainly seems a curious story, that when he sailed the old Categut whaleman, his crew, upon arriving home, were mostly all carried ashore to the hospital, sore exhausted and worn out. For a pious man, especially for a Quaker, he was certainly rather hard-hearted, to say the least. He never used to swear, though, at his men, they said; but somehow he got an inordinate quantity of cruel, unmitigated hard work out of them. When Bildad was a chief-mate, to have his drab-coloured eye intently looking at you, made you feel completely nervous, till you could clutch something—a hammer or a marling-spike, and go to work like mad, at something or other, never mind what. Indolence and idleness perished before him. His own person was the exact embodiment of his utilitarian character. On his long, gaunt body, he carried no spare flesh, no superfluous beard, his chin having a soft, economical nap to it, like the worn nap of his broad-brimmed hat.

Such, then, was the person that I saw seated on the transom when I followed Captain Peleg down into the cabin. The space between the decks was small; and there, bolt-upright, sat old Bildad, who always sat so, and never leaned, and this to save his coat tails. His broad-brim was placed beside him; his legs were stiffly crossed; his drab vesture was buttoned up to his chin; and spectacles on nose, he seemed absorbed in reading from a ponderous volume.

“Bildad,” cried Captain Peleg, “at it again, Bildad, eh? Ye have been studying those Scriptures, now, for the last thirty years, to my certain knowledge. How far ye got, Bildad?”

As if long habituated to such profane talk from his old shipmate, Bildad, without noticing his present irreverence, quietly looked up, and seeing me, glanced again inquiringly towards Peleg.

“He says he’s our man, Bildad,” said Peleg, “he wants to ship.”

“Dost thee?” said Bildad, in a hollow tone, and turning round to me.

“I dost,” said I unconsciously, he was so intense a Quaker.

“What do ye think of him, Bildad?” said Peleg.

“He’ll do,” said Bildad, eyeing me, and then went on spelling away at his book in a mumbling tone quite audible.

I thought him the queerest old Quaker I ever saw, especially as Peleg, his friend and old shipmate, seemed such a blusterer. But I said nothing, only looking round me sharply. Peleg now threw open a chest, and drawing forth the ship’s articles, placed pen and ink before him, and seated himself at a little table. I began to think it was high time to settle with myself at what terms I would be willing to engage for the voyage. I was already aware that in the whaling business they paid no wages; but all hands, including the captain, received certain shares of the profits called lays, and that these lays were proportioned to the degree of importance pertaining to the respective duties of the ship’s company. I was also aware that being a green hand at whaling, my own lay would not be very large; but considering that I was used to the sea, could steer a ship, splice a rope, and all that, I made no doubt that from all I had heard I should be offered at least the 275th lay—that is, the 275th part of the clear net proceeds of the voyage, whatever that might eventually amount to. And though the 275th lay was what they call a rather long lay, yet it was better than nothing; and if we had a lucky voyage, might pretty nearly pay for the clothing I would wear out on it, not to speak of my three years’ beef and board, for which I would not have to pay one stiver.

It might be thought that this was a poor way to accumulate a princely fortune—and so it was, a very poor way indeed. But I am one of those that never take on about princely fortunes, and am quite content if the world is ready to board and lodge me, while I am putting up at this grim sign of the Thunder Cloud. Upon the whole, I thought that the 275th lay would be about the fair thing, but would not have been surprised had I been offered the 200th, considering I was of a broad-shouldered make.

But one thing, nevertheless, that made me a little distrustful about receiving a generous share of the profits was this: Ashore, I had heard something of both Captain Peleg and his unaccountable old crony Bildad; how that they being the principal proprietors of the Pequod, therefore the other and more inconsiderable and scattered owners, left nearly the whole management of the ship’s affairs to these two. And I did not know but what the stingy old Bildad might have a mighty deal to say about shipping hands, especially as I now found him on board the Pequod, quite at home there in the cabin, and reading his Bible as if at his own fireside. Now while Peleg was vainly trying to mend a pen with his jack-knife, old Bildad, to my no small surprise, considering that he was such an interested party in these proceedings; Bildad never heeded us, but went on mumbling to himself out of his book, “Lay not up for yourselves treasures upon earth, where moth—”

“Well, Captain Bildad,” interrupted Peleg, “what d’ye say, what lay shall we give this young man?”

“Thou knowest best,” was the sepulchral reply, “the seven hundred and seventy-seventh wouldn’t be too much, would it?—‘where moth and rust do corrupt, but lay—’”

Lay, indeed, thought I, and such a lay! the seven hundred and seventy-seventh! Well, old Bildad, you are determined that I, for one, shall not lay up many lays here below, where moth and rust do corrupt. It was an exceedingly long lay that, indeed; and though from the magnitude of the figure it might at first deceive a landsman, yet the slightest consideration will show that though seven hundred and seventy-seven is a pretty large number, yet, when you come to make a teenth of it, you will then see, I say, that the seven hundred and seventy-seventh part of a farthing is a good deal less than seven hundred and seventy-seven gold doubloons; and so I thought at the time.

“Why, blast your eyes, Bildad,” cried Peleg, “thou dost not want to swindle this young man! he must have more than that.”

“Seven hundred and seventy-seventh,” again said Bildad, without lifting his eyes; and then went on mumbling—“for where your treasure is, there will your heart be also.”

“I am going to put him down for the three hundredth,” said Peleg, “do ye hear that, Bildad! The three hundredth lay, I say.”

Bildad laid down his book, and turning solemnly towards him said, “Captain Peleg, thou hast a generous heart; but thou must consider the duty thou owest to the other owners of this ship—widows and orphans, many of them—and that if we too abundantly reward the labors of this young man, we may be taking the bread from those widows and those orphans. The seven hundred and seventy-seventh lay, Captain Peleg.”

“Thou Bildad!” roared Peleg, starting up and clattering about the cabin. “Blast ye, Captain Bildad, if I had followed thy advice in these matters, I would afore now had a conscience to lug about that would be heavy enough to founder the largest ship that ever sailed round Cape Horn.”

“Captain Peleg,” said Bildad steadily, “thy conscience may be drawing ten inches of water, or ten fathoms, I can’t tell; but as thou art still an impenitent man, Captain Peleg, I greatly fear lest thy conscience be but a leaky one; and will in the end sink thee foundering down to the fiery pit, Captain Peleg.”

“Fiery pit! fiery pit! ye insult me, man; past all natural bearing, ye insult me. It’s an all-fired outrage to tell any human creature that he’s bound to hell. Flukes and flames! Bildad, say that again to me, and start my soul-bolts, but I’ll—I’ll—yes, I’ll swallow a live goat with all his hair and horns on. Out of the cabin, ye canting, drab-coloured son of a wooden gun—a straight wake with ye!”

As he thundered out this he made a rush at Bildad, but with a marvellous oblique, sliding celerity, Bildad for that time eluded him.

Alarmed at this terrible outburst between the two principal and responsible owners of the ship, and feeling half a mind to give up all idea of sailing in a vessel so questionably owned and temporarily commanded, I stepped aside from the door to give egress to Bildad, who, I made no doubt, was all eagerness to vanish from before the awakened wrath of Peleg. But to my astonishment, he sat down again on the transom very quietly, and seemed to have not the slightest intention of withdrawing. He seemed quite used to impenitent Peleg and his ways. As for Peleg, after letting off his rage as he had, there seemed no more left in him, and he, too, sat down like a lamb, though he twitched a little as if still nervously agitated. “Whew!” he whistled at last—“the squall’s gone off to leeward, I think. Bildad, thou used to be good at sharpening a lance, mend that pen, will ye. My jack-knife here needs the grindstone. That’s he; thank ye, Bildad. Now then, my young man, Ishmael’s thy name, didn’t ye say? Well then, down ye go here, Ishmael, for the three hundredth lay.”

“Captain Peleg,” said I, “I have a friend with me who wants to ship too—shall I bring him down to-morrow?”

“To be sure,” said Peleg. “Fetch him along, and we’ll look at him.”

“What lay does he want?” groaned Bildad, glancing up from the book in which he had again been burying himself.

“Oh! never thee mind about that, Bildad,” said Peleg. “Has he ever whaled it any?” turning to me.

“Killed more whales than I can count, Captain Peleg.”

“Well, bring him along then.”

And, after signing the papers, off I went; nothing doubting but that I had done a good morning’s work, and that the Pequod was the identical ship that Yojo had provided to carry Queequeg and me round the Cape.

But I had not proceeded far, when I began to bethink me that the Captain with whom I was to sail yet remained unseen by me; though, indeed, in many cases, a whale-ship will be completely fitted out, and receive all her crew on board, ere the captain makes himself visible by arriving to take command; for sometimes these voyages are so prolonged, and the shore intervals at home so exceedingly brief, that if the captain have a family, or any absorbing concernment of that sort, he does not trouble himself much about his ship in port, but leaves her to the owners till all is ready for sea. However, it is always as well to have a look at him before irrevocably committing yourself into his hands. Turning back I accosted Captain Peleg, inquiring where Captain Ahab was to be found.

“And what dost thou want of Captain Ahab? It’s all right enough; thou art shipped.”

“Yes, but I should like to see him.”

“But I don’t think thou wilt be able to at present. I don’t know exactly what’s the matter with him; but he keeps close inside the house; a sort of sick, and yet he don’t look so. In fact, he ain’t sick; but no, he isn’t well either. Any how, young man, he won’t always see me, so I don’t suppose he will thee. He’s a queer man, Captain Ahab—so some think—but a good one. Oh, thou’lt like him well enough; no fear, no fear. He’s a grand, ungodly, god-like man, Captain Ahab; doesn’t speak much; but, when he does speak, then you may well listen. Mark ye, be forewarned; Ahab’s above the common; Ahab’s been in colleges, as well as ’mong the cannibals; been used to deeper wonders than the waves; fixed his fiery lance in mightier, stranger foes than whales. His lance! aye, the keenest and the surest that out of all our isle! Oh! he ain’t Captain Bildad; no, and he ain’t Captain Peleg; he’s Ahab, boy; and Ahab of old, thou knowest, was a crowned king!”

“And a very vile one. When that wicked king was slain, the dogs, did they not lick his blood?”

“Come hither to me—hither, hither,” said Peleg, with a significance in his eye that almost startled me. “Look ye, lad; never say that on board the Pequod. Never say it anywhere. Captain Ahab did not name himself. ’Twas a foolish, ignorant whim of his crazy, widowed mother, who died when he was only a twelvemonth old. And yet the old squaw Tistig, at Gayhead, said that the name would somehow prove prophetic. And, perhaps, other fools like her may tell thee the same. I wish to warn thee. It’s a lie. I know Captain Ahab well; I’ve sailed with him as mate years ago; I know what he is—a good man—not a pious, good man, like Bildad, but a swearing good man—something like me—only there’s a good deal more of him. Aye, aye, I know that he was never very jolly; and I know that on the passage home, he was a little out of his mind for a spell; but it was the sharp shooting pains in his bleeding stump that brought that about, as any one might see. I know, too, that ever since he lost his leg last voyage by that accursed whale, he’s been a kind of moody—desperate moody, and savage sometimes; but that will all pass off. And once for all, let me tell thee and assure thee, young man, it’s better to sail with a moody good captain than a laughing bad one. So good-bye to thee—and wrong not Captain Ahab, because he happens to have a wicked name. Besides, my boy, he has a wife—not three voyages wedded—a sweet, resigned girl. Think of that; by that sweet girl that old man has a child: hold ye then there can be any utter, hopeless harm in Ahab? No, no, my lad; stricken, blasted, if he be, Ahab has his humanities!”

As I walked away, I was full of thoughtfulness; what had been incidentally revealed to me of Captain Ahab, filled me with a certain wild vagueness of painfulness concerning him. And somehow, at the time, I felt a sympathy and a sorrow for him, but for I don’t know what, unless it was the cruel loss of his leg. And yet I also felt a strange awe of him; but that sort of awe, which I cannot at all describe, was not exactly awe; I do not know what it was. But I felt it; and it did not disincline me towards him; though I felt impatience at what seemed like mystery in him, so imperfectly as he was known to me then. However, my thoughts were at length carried in other directions, so that for the present dark Ahab slipped my mind.






CHAPTER 17. The Ramadan.
As Queequeg’s Ramadan, or Fasting and Humiliation, was to continue all day, I did not choose to disturb him till towards night-fall; for I cherish the greatest respect towards everybody’s religious obligations, never mind how comical, and could not find it in my heart to undervalue even a congregation of ants worshipping a toad-stool; or those other creatures in certain parts of our earth, who with a degree of footmanism quite unprecedented in other planets, bow down before the torso of a deceased landed proprietor merely on account of the inordinate possessions yet owned and rented in his name.

I say, we good Presbyterian Christians should be charitable in these things, and not fancy ourselves so vastly superior to other mortals, pagans and what not, because of their half-crazy conceits on these subjects. There was Queequeg, now, certainly entertaining the most absurd notions about Yojo and his Ramadan;—but what of that? Queequeg thought he knew what he was about, I suppose; he seemed to be content; and there let him rest. All our arguing with him would not avail; let him be, I say: and Heaven have mercy on us all—Presbyterians and Pagans alike—for we are all somehow dreadfully cracked about the head, and sadly need mending.

Towards evening, when I felt assured that all his performances and rituals must be over, I went up to his room and knocked at the door; but no answer. I tried to open it, but it was fastened inside. “Queequeg,” said I softly through the key-hole:—all silent. “I say, Queequeg! why don’t you speak? It’s I—Ishmael.” But all remained still as before. I began to grow alarmed. I had allowed him such abundant time; I thought he might have had an apoplectic fit. I looked through the key-hole; but the door opening into an odd corner of the room, the key-hole prospect was but a crooked and sinister one. I could only see part of the foot-board of the bed and a line of the wall, but nothing more. I was surprised to behold resting against the wall the wooden shaft of Queequeg’s harpoon, which the landlady the evening previous had taken from him, before our mounting to the chamber. That’s strange, thought I; but at any rate, since the harpoon stands yonder, and he seldom or never goes abroad without it, therefore he must be inside here, and no possible mistake.

“Queequeg!—Queequeg!”—all still. Something must have happened. Apoplexy! I tried to burst open the door; but it stubbornly resisted. Running down stairs, I quickly stated my suspicions to the first person I met—the chamber-maid. “La! la!” she cried, “I thought something must be the matter. I went to make the bed after breakfast, and the door was locked; and not a mouse to be heard; and it’s been just so silent ever since. But I thought, may be, you had both gone off and locked your baggage in for safe keeping. La! la, ma’am!—Mistress! murder! Mrs. Hussey! apoplexy!”—and with these cries, she ran towards the kitchen, I following.

Mrs. Hussey soon appeared, with a mustard-pot in one hand and a vinegar-cruet in the other, having just broken away from the occupation of attending to the castors, and scolding her little black boy meantime.

“Wood-house!” cried I, “which way to it? Run for God’s sake, and fetch something to pry open the door—the axe!—the axe! he’s had a stroke; depend upon it!”—and so saying I was unmethodically rushing up stairs again empty-handed, when Mrs. Hussey interposed the mustard-pot and vinegar-cruet, and the entire castor of her countenance.

“What’s the matter with you, young man?”

“Get the axe! For God’s sake, run for the doctor, some one, while I pry it open!”

“Look here,” said the landlady, quickly putting down the vinegar-cruet, so as to have one hand free; “look here; are you talking about prying open any of my doors?”—and with that she seized my arm. “What’s the matter with you? What’s the matter with you, shipmate?”

In as calm, but rapid a manner as possible, I gave her to understand the whole case. Unconsciously clapping the vinegar-cruet to one side of her nose, she ruminated for an instant; then exclaimed—“No! I haven’t seen it since I put it there.” Running to a little closet under the landing of the stairs, she glanced in, and returning, told me that Queequeg’s harpoon was missing. “He’s killed himself,” she cried. “It’s unfort’nate Stiggs done over again—there goes another counterpane—God pity his poor mother!—it will be the ruin of my house. Has the poor lad a sister? Where’s that girl?—there, Betty, go to Snarles the Painter, and tell him to paint me a sign, with—“no suicides permitted here, and no smoking in the parlor;”—might as well kill both birds at once. Kill? The Lord be merciful to his ghost! What’s that noise there? You, young man, avast there!”

And running up after me, she caught me as I was again trying to force open the door.

“I don’t allow it; I won’t have my premises spoiled. Go for the locksmith, there’s one about a mile from here. But avast!” putting her hand in her side-pocket, “here’s a key that’ll fit, I guess; let’s see.” And with that, she turned it in the lock; but, alas! Queequeg’s supplemental bolt remained unwithdrawn within.

“Have to burst it open,” said I, and was running down the entry a little, for a good start, when the landlady caught at me, again vowing I should not break down her premises; but I tore from her, and with a sudden bodily rush dashed myself full against the mark.

With a prodigious noise the door flew open, and the knob slamming against the wall, sent the plaster to the ceiling; and there, good heavens! there sat Queequeg, altogether cool and self-collected; right in the middle of the room; squatting on his hams, and holding Yojo on top of his head. He looked neither one way nor the other way, but sat like a carved image with scarce a sign of active life.

“Queequeg,” said I, going up to him, “Queequeg, what’s the matter with you?”

“He hain’t been a sittin’ so all day, has he?” said the landlady.

But all we said, not a word could we drag out of him; I almost felt like pushing him over, so as to change his position, for it was almost intolerable, it seemed so painfully and unnaturally constrained; especially, as in all probability he had been sitting so for upwards of eight or ten hours, going too without his regular meals.

“Mrs. Hussey,” said I, “he’s alive at all events; so leave us, if you please, and I will see to this strange affair myself.”

Closing the door upon the landlady, I endeavored to prevail upon Queequeg to take a chair; but in vain. There he sat; and all he could do—for all my polite arts and blandishments—he would not move a peg, nor say a single word, nor even look at me, nor notice my presence in the slightest way.

I wonder, thought I, if this can possibly be a part of his Ramadan; do they fast on their hams that way in his native island. It must be so; yes, it’s part of his creed, I suppose; well, then, let him rest; he’ll get up sooner or later, no doubt. It can’t last for ever, thank God, and his Ramadan only comes once a year; and I don’t believe it’s very punctual then.

I went down to supper. After sitting a long time listening to the long stories of some sailors who had just come from a plum-pudding voyage, as they called it (that is, a short whaling-voyage in a schooner or brig, confined to the north of the line, in the Atlantic Ocean only); after listening to these plum-puddingers till nearly eleven o’clock, I went up stairs to go to bed, feeling quite sure by this time Queequeg must certainly have brought his Ramadan to a termination. But no; there he was just where I had left him; he had not stirred an inch. I began to grow vexed with him; it seemed so downright senseless and insane to be sitting there all day and half the night on his hams in a cold room, holding a piece of wood on his head.

“For heaven’s sake, Queequeg, get up and shake yourself; get up and have some supper. You’ll starve; you’ll kill yourself, Queequeg.” But not a word did he reply.

Despairing of him, therefore, I determined to go to bed and to sleep; and no doubt, before a great while, he would follow me. But previous to turning in, I took my heavy bearskin jacket, and threw it over him, as it promised to be a very cold night; and he had nothing but his ordinary round jacket on. For some time, do all I would, I could not get into the faintest doze. I had blown out the candle; and the mere thought of Queequeg—not four feet off—sitting there in that uneasy position, stark alone in the cold and dark; this made me really wretched. Think of it; sleeping all night in the same room with a wide awake pagan on his hams in this dreary, unaccountable Ramadan!

But somehow I dropped off at last, and knew nothing more till break of day; when, looking over the bedside, there squatted Queequeg, as if he had been screwed down to the floor. But as soon as the first glimpse of sun entered the window, up he got, with stiff and grating joints, but with a cheerful look; limped towards me where I lay; pressed his forehead again against mine; and said his Ramadan was over.

Now, as I before hinted, I have no objection to any person’s religion, be it what it may, so long as that person does not kill or insult any other person, because that other person don’t believe it also. But when a man’s religion becomes really frantic; when it is a positive torment to him; and, in fine, makes this earth of ours an uncomfortable inn to lodge in; then I think it high time to take that individual aside and argue the point with him.

And just so I now did with Queequeg. “Queequeg,” said I, “get into bed now, and lie and listen to me.” I then went on, beginning with the rise and progress of the primitive religions, and coming down to the various religions of the present time, during which time I labored to show Queequeg that all these Lents, Ramadans, and prolonged ham-squattings in cold, cheerless rooms were stark nonsense; bad for the health; useless for the soul; opposed, in short, to the obvious laws of Hygiene and common sense. I told him, too, that he being in other things such an extremely sensible and sagacious savage, it pained me, very badly pained me, to see him now so deplorably foolish about this ridiculous Ramadan of his. Besides, argued I, fasting makes the body cave in; hence the spirit caves in; and all thoughts born of a fast must necessarily be half-starved. This is the reason why most dyspeptic religionists cherish such melancholy notions about their hereafters. In one word, Queequeg, said I, rather digressively; hell is an idea first born on an undigested apple-dumpling; and since then perpetuated through the hereditary dyspepsias nurtured by Ramadans.

I then asked Queequeg whether he himself was ever troubled with dyspepsia; expressing the idea very plainly, so that he could take it in. He said no; only upon one memorable occasion. It was after a great feast given by his father the king, on the gaining of a great battle wherein fifty of the enemy had been killed by about two o’clock in the afternoon, and all cooked and eaten that very evening.

“No more, Queequeg,” said I, shuddering; “that will do;” for I knew the inferences without his further hinting them. I had seen a sailor who had visited that very island, and he told me that it was the custom, when a great battle had been gained there, to barbecue all the slain in the yard or garden of the victor; and then, one by one, they were placed in great wooden trenchers, and garnished round like a pilau, with breadfruit and cocoanuts; and with some parsley in their mouths, were sent round with the victor’s compliments to all his friends, just as though these presents were so many Christmas turkeys.

After all, I do not think that my remarks about religion made much impression upon Queequeg. Because, in the first place, he somehow seemed dull of hearing on that important subject, unless considered from his own point of view; and, in the second place, he did not more than one third understand me, couch my ideas simply as I would; and, finally, he no doubt thought he knew a good deal more about the true religion than I did. He looked at me with a sort of condescending concern and compassion, as though he thought it a great pity that such a sensible young man should be so hopelessly lost to evangelical pagan piety.

At last we rose and dressed; and Queequeg, taking a prodigiously hearty breakfast of chowders of all sorts, so that the landlady should not make much profit by reason of his Ramadan, we sallied out to board the Pequod, sauntering along, and picking our teeth with halibut bones.






CHAPTER 18. His Mark.
As we were walking down the end of the wharf towards the ship, Queequeg carrying his harpoon, Captain Peleg in his gruff voice loudly hailed us from his wigwam, saying he had not suspected my friend was a cannibal, and furthermore announcing that he let no cannibals on board that craft, unless they previously produced their papers.

“What do you mean by that, Captain Peleg?” said I, now jumping on the bulwarks, and leaving my comrade standing on the wharf.

“I mean,” he replied, “he must show his papers.”

“Yes,” said Captain Bildad in his hollow voice, sticking his head from behind Peleg’s, out of the wigwam. “He must show that he’s converted. Son of darkness,” he added, turning to Queequeg, “art thou at present in communion with any Christian church?”

“Why,” said I, “he’s a member of the first Congregational Church.” Here be it said, that many tattooed savages sailing in Nantucket ships at last come to be converted into the churches.

“First Congregational Church,” cried Bildad, “what! that worships in Deacon Deuteronomy Coleman’s meeting-house?” and so saying, taking out his spectacles, he rubbed them with his great yellow bandana handkerchief, and putting them on very carefully, came out of the wigwam, and leaning stiffly over the bulwarks, took a good long look at Queequeg.

“How long hath he been a member?” he then said, turning to me; “not very long, I rather guess, young man.”

“No,” said Peleg, “and he hasn’t been baptized right either, or it would have washed some of that devil’s blue off his face.”

“Do tell, now,” cried Bildad, “is this Philistine a regular member of Deacon Deuteronomy’s meeting? I never saw him going there, and I pass it every Lord’s day.”

“I don’t know anything about Deacon Deuteronomy or his meeting,” said I; “all I know is, that Queequeg here is a born member of the First Congregational Church. He is a deacon himself, Queequeg is.”

“Young man,” said Bildad sternly, “thou art skylarking with me—explain thyself, thou young Hittite. What church dost thee mean? answer me.”

Finding myself thus hard pushed, I replied. “I mean, sir, the same ancient Catholic Church to which you and I, and Captain Peleg there, and Queequeg here, and all of us, and every mother’s son and soul of us belong; the great and everlasting First Congregation of this whole worshipping world; we all belong to that; only some of us cherish some queer crotchets no ways touching the grand belief; in that we all join hands.”

“Splice, thou mean’st splice hands,” cried Peleg, drawing nearer. “Young man, you’d better ship for a missionary, instead of a fore-mast hand; I never heard a better sermon. Deacon Deuteronomy—why Father Mapple himself couldn’t beat it, and he’s reckoned something. Come aboard, come aboard; never mind about the papers. I say, tell Quohog there—what’s that you call him? tell Quohog to step along. By the great anchor, what a harpoon he’s got there! looks like good stuff that; and he handles it about right. I say, Quohog, or whatever your name is, did you ever stand in the head of a whale-boat? did you ever strike a fish?”

Without saying a word, Queequeg, in his wild sort of way, jumped upon the bulwarks, from thence into the bows of one of the whale-boats hanging to the side; and then bracing his left knee, and poising his harpoon, cried out in some such way as this:—

“Cap’ain, you see him small drop tar on water dere? You see him? well, spose him one whale eye, well, den!” and taking sharp aim at it, he darted the iron right over old Bildad’s broad brim, clean across the ship’s decks, and struck the glistening tar spot out of sight.

“Now,” said Queequeg, quietly hauling in the line, “spos-ee him whale-e eye; why, dad whale dead.”

“Quick, Bildad,” said Peleg, his partner, who, aghast at the close vicinity of the flying harpoon, had retreated towards the cabin gangway. “Quick, I say, you Bildad, and get the ship’s papers. We must have Hedgehog there, I mean Quohog, in one of our boats. Look ye, Quohog, we’ll give ye the ninetieth lay, and that’s more than ever was given a harpooneer yet out of Nantucket.”

So down we went into the cabin, and to my great joy Queequeg was soon enrolled among the same ship’s company to which I myself belonged.

When all preliminaries were over and Peleg had got everything ready for signing, he turned to me and said, “I guess, Quohog there don’t know how to write, does he? I say, Quohog, blast ye! dost thou sign thy name or make thy mark?”

But at this question, Queequeg, who had twice or thrice before taken part in similar ceremonies, looked no ways abashed; but taking the offered pen, copied upon the paper, in the proper place, an exact counterpart of a queer round figure which was tattooed upon his arm; so that through Captain Peleg’s obstinate mistake touching his appellative, it stood something like this:—

Quohog. his X mark.

Meanwhile Captain Bildad sat earnestly and steadfastly eyeing Queequeg, and at last rising solemnly and fumbling in the huge pockets of his broad-skirted drab coat, took out a bundle of tracts, and selecting one entitled “The Latter Day Coming; or No Time to Lose,” placed it in Queequeg’s hands, and then grasping them and the book with both his, looked earnestly into his eyes, and said, “Son of darkness, I must do my duty by thee; I am part owner of this ship, and feel concerned for the souls of all its crew; if thou still clingest to thy Pagan ways, which I sadly fear, I beseech thee, remain not for aye a Belial bondsman. Spurn the idol Bell, and the hideous dragon; turn from the wrath to come; mind thine eye, I say; oh! goodness gracious! steer clear of the fiery pit!”

Something of the salt sea yet lingered in old Bildad’s language, heterogeneously mixed with Scriptural and domestic phrases.

“Avast there, avast there, Bildad, avast now spoiling our harpooneer,” cried Peleg. “Pious harpooneers never make good voyagers—it takes the shark out of ’em; no harpooneer is worth a straw who aint pretty sharkish. There was young Nat Swaine, once the bravest boat-header out of all Nantucket and the Vineyard; he joined the meeting, and never came to good. He got so frightened about his plaguy soul, that he shrinked and sheered away from whales, for fear of after-claps, in case he got stove and went to Davy Jones.”

“Peleg! Peleg!” said Bildad, lifting his eyes and hands, “thou thyself, as I myself, hast seen many a perilous time; thou knowest, Peleg, what it is to have the fear of death; how, then, can’st thou prate in this ungodly guise. Thou beliest thine own heart, Peleg. Tell me, when this same Pequod here had her three masts overboard in that typhoon on Japan, that same voyage when thou went mate with Captain Ahab, did’st thou not think of Death and the Judgment then?”

“Hear him, hear him now,” cried Peleg, marching across the cabin, and thrusting his hands far down into his pockets,—“hear him, all of ye. Think of that! When every moment we thought the ship would sink! Death and the Judgment then? What? With all three masts making such an everlasting thundering against the side; and every sea breaking over us, fore and aft. Think of Death and the Judgment then? No! no time to think about Death then. Life was what Captain Ahab and I was thinking of; and how to save all hands—how to rig jury-masts—how to get into the nearest port; that was what I was thinking of.”

Bildad said no more, but buttoning up his coat, stalked on deck, where we followed him. There he stood, very quietly overlooking some sailmakers who were mending a top-sail in the waist. Now and then he stooped to pick up a patch, or save an end of tarred twine, which otherwise might have been wasted.






CHAPTER 19. The Prophet.
“Shipmates, have ye shipped in that ship?”

Queequeg and I had just left the Pequod, and were sauntering away from the water, for the moment each occupied with his own thoughts, when the above words were put to us by a stranger, who, pausing before us, levelled his massive forefinger at the vessel in question. He was but shabbily apparelled in faded jacket and patched trowsers; a rag of a black handkerchief investing his neck. A confluent small-pox had in all directions flowed over his face, and left it like the complicated ribbed bed of a torrent, when the rushing waters have been dried up.

“Have ye shipped in her?” he repeated.

“You mean the ship Pequod, I suppose,” said I, trying to gain a little more time for an uninterrupted look at him.

“Aye, the Pequod—that ship there,” he said, drawing back his whole arm, and then rapidly shoving it straight out from him, with the fixed bayonet of his pointed finger darted full at the object.

“Yes,” said I, “we have just signed the articles.”

“Anything down there about your souls?”

“About what?”

“Oh, perhaps you hav’n’t got any,” he said quickly. “No matter though, I know many chaps that hav’n’t got any,—good luck to ’em; and they are all the better off for it. A soul’s a sort of a fifth wheel to a wagon.”

“What are you jabbering about, shipmate?” said I.

“He’s got enough, though, to make up for all deficiencies of that sort in other chaps,” abruptly said the stranger, placing a nervous emphasis upon the word he.

“Queequeg,” said I, “let’s go; this fellow has broken loose from somewhere; he’s talking about something and somebody we don’t know.”

“Stop!” cried the stranger. “Ye said true—ye hav’n’t seen Old Thunder yet, have ye?”

“Who’s Old Thunder?” said I, again riveted with the insane earnestness of his manner.

“Captain Ahab.”

“What! the captain of our ship, the Pequod?”

“Aye, among some of us old sailor chaps, he goes by that name. Ye hav’n’t seen him yet, have ye?”

“No, we hav’n’t. He’s sick they say, but is getting better, and will be all right again before long.”

“All right again before long!” laughed the stranger, with a solemnly derisive sort of laugh. “Look ye; when Captain Ahab is all right, then this left arm of mine will be all right; not before.”

“What do you know about him?”

“What did they tell you about him? Say that!”

“They didn’t tell much of anything about him; only I’ve heard that he’s a good whale-hunter, and a good captain to his crew.”

“That’s true, that’s true—yes, both true enough. But you must jump when he gives an order. Step and growl; growl and go—that’s the word with Captain Ahab. But nothing about that thing that happened to him off Cape Horn, long ago, when he lay like dead for three days and nights; nothing about that deadly skrimmage with the Spaniard afore the altar in Santa?—heard nothing about that, eh? Nothing about the silver calabash he spat into? And nothing about his losing his leg last voyage, according to the prophecy. Didn’t ye hear a word about them matters and something more, eh? No, I don’t think ye did; how could ye? Who knows it? Not all Nantucket, I guess. But hows’ever, mayhap, ye’ve heard tell about the leg, and how he lost it; aye, ye have heard of that, I dare say. Oh yes, that every one knows a’most—I mean they know he’s only one leg; and that a parmacetti took the other off.”

“My friend,” said I, “what all this gibberish of yours is about, I don’t know, and I don’t much care; for it seems to me that you must be a little damaged in the head. But if you are speaking of Captain Ahab, of that ship there, the Pequod, then let me tell you, that I know all about the loss of his leg.”

“All about it, eh—sure you do?—all?”

“Pretty sure.”

With finger pointed and eye levelled at the Pequod, the beggar-like stranger stood a moment, as if in a troubled reverie; then starting a little, turned and said:—“Ye’ve shipped, have ye? Names down on the papers? Well, well, what’s signed, is signed; and what’s to be, will be; and then again, perhaps it won’t be, after all. Anyhow, it’s all fixed and arranged a’ready; and some sailors or other must go with him, I suppose; as well these as any other men, God pity ’em! Morning to ye, shipmates, morning; the ineffable heavens bless ye; I’m sorry I stopped ye.”

“Look here, friend,” said I, “if you have anything important to tell us, out with it; but if you are only trying to bamboozle us, you are mistaken in your game; that’s all I have to say.”

“And it’s said very well, and I like to hear a chap talk up that way; you are just the man for him—the likes of ye. Morning to ye, shipmates, morning! Oh! when ye get there, tell ’em I’ve concluded not to make one of ’em.”

“Ah, my dear fellow, you can’t fool us that way—you can’t fool us. It is the easiest thing in the world for a man to look as if he had a great secret in him.”

“Morning to ye, shipmates, morning.”

“Morning it is,” said I. “Come along, Queequeg, let’s leave this crazy man. But stop, tell me your name, will you?”

“Elijah.”

Elijah! thought I, and we walked away, both commenting, after each other’s fashion, upon this ragged old sailor; and agreed that he was nothing but a humbug, trying to be a bugbear. But we had not gone perhaps above a hundred yards, when chancing to turn a corner, and looking back as I did so, who should be seen but Elijah following us, though at a distance. Somehow, the sight of him struck me so, that I said nothing to Queequeg of his being behind, but passed on with my comrade, anxious to see whether the stranger would turn the same corner that we did. He did; and then it seemed to me that he was dogging us, but with what intent I could not for the life of me imagine. This circumstance, coupled with his ambiguous, half-hinting, half-revealing, shrouded sort of talk, now begat in me all kinds of vague wonderments and half-apprehensions, and all connected with the Pequod; and Captain Ahab; and the leg he had lost; and the Cape Horn fit; and the silver calabash; and what Captain Peleg had said of him, when I left the ship the day previous; and the prediction of the squaw Tistig; and the voyage we had bound ourselves to sail; and a hundred other shadowy things.

I was resolved to satisfy myself whether this ragged Elijah was really dogging us or not, and with that intent crossed the way with Queequeg, and on that side of it retraced our steps. But Elijah passed on, without seeming to notice us. This relieved me; and once more, and finally as it seemed to me, I pronounced him in my heart, a humbug.






CHAPTER 20. All Astir.
A day or two passed, and there was great activity aboard the Pequod. Not only were the old sails being mended, but new sails were coming on board, and bolts of canvas, and coils of rigging; in short, everything betokened that the ship’s preparations were hurrying to a close. Captain Peleg seldom or never went ashore, but sat in his wigwam keeping a sharp look-out upon the hands: Bildad did all the purchasing and providing at the stores; and the men employed in the hold and on the rigging were working till long after night-fall.

On the day following Queequeg’s signing the articles, word was given at all the inns where the ship’s company were stopping, that their chests must be on board before night, for there was no telling how soon the vessel might be sailing. So Queequeg and I got down our traps, resolving, however, to sleep ashore till the last. But it seems they always give very long notice in these cases, and the ship did not sail for several days. But no wonder; there was a good deal to be done, and there is no telling how many things to be thought of, before the Pequod was fully equipped.

Every one knows what a multitude of things—beds, sauce-pans, knives and forks, shovels and tongs, napkins, nut-crackers, and what not, are indispensable to the business of housekeeping. Just so with whaling, which necessitates a three-years’ housekeeping upon the wide ocean, far from all grocers, costermongers, doctors, bakers, and bankers. And though this also holds true of merchant vessels, yet not by any means to the same extent as with whalemen. For besides the great length of the whaling voyage, the numerous articles peculiar to the prosecution of the fishery, and the impossibility of replacing them at the remote harbors usually frequented, it must be remembered, that of all ships, whaling vessels are the most exposed to accidents of all kinds, and especially to the destruction and loss of the very things upon which the success of the voyage most depends. Hence, the spare boats, spare spars, and spare lines and harpoons, and spare everythings, almost, but a spare Captain and duplicate ship.

At the period of our arrival at the Island, the heaviest storage of the Pequod had been almost completed; comprising her beef, bread, water, fuel, and iron hoops and staves. But, as before hinted, for some time there was a continual fetching and carrying on board of divers odds and ends of things, both large and small.

Chief among those who did this fetching and carrying was Captain Bildad’s sister, a lean old lady of a most determined and indefatigable spirit, but withal very kindhearted, who seemed resolved that, if she could help it, nothing should be found wanting in the Pequod, after once fairly getting to sea. At one time she would come on board with a jar of pickles for the steward’s pantry; another time with a bunch of quills for the chief mate’s desk, where he kept his log; a third time with a roll of flannel for the small of some one’s rheumatic back. Never did any woman better deserve her name, which was Charity—Aunt Charity, as everybody called her. And like a sister of charity did this charitable Aunt Charity bustle about hither and thither, ready to turn her hand and heart to anything that promised to yield safety, comfort, and consolation to all on board a ship in which her beloved brother Bildad was concerned, and in which she herself owned a score or two of well-saved dollars.

But it was startling to see this excellent hearted Quakeress coming on board, as she did the last day, with a long oil-ladle in one hand, and a still longer whaling lance in the other. Nor was Bildad himself nor Captain Peleg at all backward. As for Bildad, he carried about with him a long list of the articles needed, and at every fresh arrival, down went his mark opposite that article upon the paper. Every once in a while Peleg came hobbling out of his whalebone den, roaring at the men down the hatchways, roaring up to the riggers at the mast-head, and then concluded by roaring back into his wigwam.

During these days of preparation, Queequeg and I often visited the craft, and as often I asked about Captain Ahab, and how he was, and when he was going to come on board his ship. To these questions they would answer, that he was getting better and better, and was expected aboard every day; meantime, the two captains, Peleg and Bildad, could attend to everything necessary to fit the vessel for the voyage. If I had been downright honest with myself, I would have seen very plainly in my heart that I did but half fancy being committed this way to so long a voyage, without once laying my eyes on the man who was to be the absolute dictator of it, so soon as the ship sailed out upon the open sea. But when a man suspects any wrong, it sometimes happens that if he be already involved in the matter, he insensibly strives to cover up his suspicions even from himself. And much this way it was with me. I said nothing, and tried to think nothing.

At last it was given out that some time next day the ship would certainly sail. So next morning, Queequeg and I took a very early start.






CHAPTER 21. Going Aboard.
It was nearly six o’clock, but only grey imperfect misty dawn, when we drew nigh the wharf.

“There are some sailors running ahead there, if I see right,” said I to Queequeg, “it can’t be shadows; she’s off by sunrise, I guess; come on!”

“Avast!” cried a voice, whose owner at the same time coming close behind us, laid a hand upon both our shoulders, and then insinuating himself between us, stood stooping forward a little, in the uncertain twilight, strangely peering from Queequeg to me. It was Elijah.

“Going aboard?”

“Hands off, will you,” said I.

“Lookee here,” said Queequeg, shaking himself, “go ’way!”

“Ain’t going aboard, then?”

“Yes, we are,” said I, “but what business is that of yours? Do you know, Mr. Elijah, that I consider you a little impertinent?”

“No, no, no; I wasn’t aware of that,” said Elijah, slowly and wonderingly looking from me to Queequeg, with the most unaccountable glances.

“Elijah,” said I, “you will oblige my friend and me by withdrawing. We are going to the Indian and Pacific Oceans, and would prefer not to be detained.”

“Ye be, be ye? Coming back afore breakfast?”

“He’s cracked, Queequeg,” said I, “come on.”

“Holloa!” cried stationary Elijah, hailing us when we had removed a few paces.

“Never mind him,” said I, “Queequeg, come on.”

But he stole up to us again, and suddenly clapping his hand on my shoulder, said—“Did ye see anything looking like men going towards that ship a while ago?”

Struck by this plain matter-of-fact question, I answered, saying, “Yes, I thought I did see four or five men; but it was too dim to be sure.”

“Very dim, very dim,” said Elijah. “Morning to ye.”

Once more we quitted him; but once more he came softly after us; and touching my shoulder again, said, “See if you can find ’em now, will ye?

“Find who?”

“Morning to ye! morning to ye!” he rejoined, again moving off. “Oh! I was going to warn ye against—but never mind, never mind—it’s all one, all in the family too;—sharp frost this morning, ain’t it? Good-bye to ye. Shan’t see ye again very soon, I guess; unless it’s before the Grand Jury.” And with these cracked words he finally departed, leaving me, for the moment, in no small wonderment at his frantic impudence.

At last, stepping on board the Pequod, we found everything in profound quiet, not a soul moving. The cabin entrance was locked within; the hatches were all on, and lumbered with coils of rigging. Going forward to the forecastle, we found the slide of the scuttle open. Seeing a light, we went down, and found only an old rigger there, wrapped in a tattered pea-jacket. He was thrown at whole length upon two chests, his face downwards and inclosed in his folded arms. The profoundest slumber slept upon him.

“Those sailors we saw, Queequeg, where can they have gone to?” said I, looking dubiously at the sleeper. But it seemed that, when on the wharf, Queequeg had not at all noticed what I now alluded to; hence I would have thought myself to have been optically deceived in that matter, were it not for Elijah’s otherwise inexplicable question. But I beat the thing down; and again marking the sleeper, jocularly hinted to Queequeg that perhaps we had best sit up with the body; telling him to establish himself accordingly. He put his hand upon the sleeper’s rear, as though feeling if it was soft enough; and then, without more ado, sat quietly down there.

“Gracious! Queequeg, don’t sit there,” said I.

“Oh! perry dood seat,” said Queequeg, “my country way; won’t hurt him face.”

“Face!” said I, “call that his face? very benevolent countenance then; but how hard he breathes, he’s heaving himself; get off, Queequeg, you are heavy, it’s grinding the face of the poor. Get off, Queequeg! Look, he’ll twitch you off soon. I wonder he don’t wake.”

Queequeg removed himself to just beyond the head of the sleeper, and lighted his tomahawk pipe. I sat at the feet. We kept the pipe passing over the sleeper, from one to the other. Meanwhile, upon questioning him in his broken fashion, Queequeg gave me to understand that, in his land, owing to the absence of settees and sofas of all sorts, the king, chiefs, and great people generally, were in the custom of fattening some of the lower orders for ottomans; and to furnish a house comfortably in that respect, you had only to buy up eight or ten lazy fellows, and lay them round in the piers and alcoves. Besides, it was very convenient on an excursion; much better than those garden-chairs which are convertible into walking-sticks; upon occasion, a chief calling his attendant, and desiring him to make a settee of himself under a spreading tree, perhaps in some damp marshy place.

While narrating these things, every time Queequeg received the tomahawk from me, he flourished the hatchet-side of it over the sleeper’s head.

“What’s that for, Queequeg?”

“Perry easy, kill-e; oh! perry easy!”

He was going on with some wild reminiscences about his tomahawk-pipe, which, it seemed, had in its two uses both brained his foes and soothed his soul, when we were directly attracted to the sleeping rigger. The strong vapor now completely filling the contracted hole, it began to tell upon him. He breathed with a sort of muffledness; then seemed troubled in the nose; then revolved over once or twice; then sat up and rubbed his eyes.

“Holloa!” he breathed at last, “who be ye smokers?”

“Shipped men,” answered I, “when does she sail?”

“Aye, aye, ye are going in her, be ye? She sails to-day. The Captain came aboard last night.”

“What Captain?—Ahab?”

“Who but him indeed?”

I was going to ask him some further questions concerning Ahab, when we heard a noise on deck.

“Holloa! Starbuck’s astir,” said the rigger. “He’s a lively chief mate, that; good man, and a pious; but all alive now, I must turn to.” And so saying he went on deck, and we followed.

It was now clear sunrise. Soon the crew came on board in twos and threes; the riggers bestirred themselves; the mates were actively engaged; and several of the shore people were busy in bringing various last things on board. Meanwhile Captain Ahab remained invisibly enshrined within his cabin.






CHAPTER 22. Merry Christmas.
At length, towards noon, upon the final dismissal of the ship’s riggers, and after the Pequod had been hauled out from the wharf, and after the ever-thoughtful Charity had come off in a whale-boat, with her last gift—a night-cap for Stubb, the second mate, her brother-in-law, and a spare Bible for the steward—after all this, the two Captains, Peleg and Bildad, issued from the cabin, and turning to the chief mate, Peleg said:

“Now, Mr. Starbuck, are you sure everything is right? Captain Ahab is all ready—just spoke to him—nothing more to be got from shore, eh? Well, call all hands, then. Muster ’em aft here—blast ’em!”

“No need of profane words, however great the hurry, Peleg,” said Bildad, “but away with thee, friend Starbuck, and do our bidding.”

How now! Here upon the very point of starting for the voyage, Captain Peleg and Captain Bildad were going it with a high hand on the quarter-deck, just as if they were to be joint-commanders at sea, as well as to all appearances in port. And, as for Captain Ahab, no sign of him was yet to be seen; only, they said he was in the cabin. But then, the idea was, that his presence was by no means necessary in getting the ship under weigh, and steering her well out to sea. Indeed, as that was not at all his proper business, but the pilot’s; and as he was not yet completely recovered—so they said—therefore, Captain Ahab stayed below. And all this seemed natural enough; especially as in the merchant service many captains never show themselves on deck for a considerable time after heaving up the anchor, but remain over the cabin table, having a farewell merry-making with their shore friends, before they quit the ship for good with the pilot.

But there was not much chance to think over the matter, for Captain Peleg was now all alive. He seemed to do most of the talking and commanding, and not Bildad.

“Aft here, ye sons of bachelors,” he cried, as the sailors lingered at the main-mast. “Mr. Starbuck, drive ’em aft.”

“Strike the tent there!”—was the next order. As I hinted before, this whalebone marquee was never pitched except in port; and on board the Pequod, for thirty years, the order to strike the tent was well known to be the next thing to heaving up the anchor.

“Man the capstan! Blood and thunder!—jump!”—was the next command, and the crew sprang for the handspikes.

Now in getting under weigh, the station generally occupied by the pilot is the forward part of the ship. And here Bildad, who, with Peleg, be it known, in addition to his other officers, was one of the licensed pilots of the port—he being suspected to have got himself made a pilot in order to save the Nantucket pilot-fee to all the ships he was concerned in, for he never piloted any other craft—Bildad, I say, might now be seen actively engaged in looking over the bows for the approaching anchor, and at intervals singing what seemed a dismal stave of psalmody, to cheer the hands at the windlass, who roared forth some sort of a chorus about the girls in Booble Alley, with hearty good will. Nevertheless, not three days previous, Bildad had told them that no profane songs would be allowed on board the Pequod, particularly in getting under weigh; and Charity, his sister, had placed a small choice copy of Watts in each seaman’s berth.

Meantime, overseeing the other part of the ship, Captain Peleg ripped and swore astern in the most frightful manner. I almost thought he would sink the ship before the anchor could be got up; involuntarily I paused on my handspike, and told Queequeg to do the same, thinking of the perils we both ran, in starting on the voyage with such a devil for a pilot. I was comforting myself, however, with the thought that in pious Bildad might be found some salvation, spite of his seven hundred and seventy-seventh lay; when I felt a sudden sharp poke in my rear, and turning round, was horrified at the apparition of Captain Peleg in the act of withdrawing his leg from my immediate vicinity. That was my first kick.

“Is that the way they heave in the marchant service?” he roared. “Spring, thou sheep-head; spring, and break thy backbone! Why don’t ye spring, I say, all of ye—spring! Quohog! spring, thou chap with the red whiskers; spring there, Scotch-cap; spring, thou green pants. Spring, I say, all of ye, and spring your eyes out!” And so saying, he moved along the windlass, here and there using his leg very freely, while imperturbable Bildad kept leading off with his psalmody. Thinks I, Captain Peleg must have been drinking something to-day.

At last the anchor was up, the sails were set, and off we glided. It was a short, cold Christmas; and as the short northern day merged into night, we found ourselves almost broad upon the wintry ocean, whose freezing spray cased us in ice, as in polished armor. The long rows of teeth on the bulwarks glistened in the moonlight; and like the white ivory tusks of some huge elephant, vast curving icicles depended from the bows.

Lank Bildad, as pilot, headed the first watch, and ever and anon, as the old craft deep dived into the green seas, and sent the shivering frost all over her, and the winds howled, and the cordage rang, his steady notes were heard,—

      “Sweet fields beyond the swelling flood,
         Stand dressed in living green.
      So to the Jews old Canaan stood,
         While Jordan rolled between.”
Never did those sweet words sound more sweetly to me than then. They were full of hope and fruition. Spite of this frigid winter night in the boisterous Atlantic, spite of my wet feet and wetter jacket, there was yet, it then seemed to me, many a pleasant haven in store; and meads and glades so eternally vernal, that the grass shot up by the spring, untrodden, unwilted, remains at midsummer.

At last we gained such an offing, that the two pilots were needed no longer. The stout sail-boat that had accompanied us began ranging alongside.

It was curious and not unpleasing, how Peleg and Bildad were affected at this juncture, especially Captain Bildad. For loath to depart, yet; very loath to leave, for good, a ship bound on so long and perilous a voyage—beyond both stormy Capes; a ship in which some thousands of his hard earned dollars were invested; a ship, in which an old shipmate sailed as captain; a man almost as old as he, once more starting to encounter all the terrors of the pitiless jaw; loath to say good-bye to a thing so every way brimful of every interest to him,—poor old Bildad lingered long; paced the deck with anxious strides; ran down into the cabin to speak another farewell word there; again came on deck, and looked to windward; looked towards the wide and endless waters, only bounded by the far-off unseen Eastern Continents; looked towards the land; looked aloft; looked right and left; looked everywhere and nowhere; and at last, mechanically coiling a rope upon its pin, convulsively grasped stout Peleg by the hand, and holding up a lantern, for a moment stood gazing heroically in his face, as much as to say, “Nevertheless, friend Peleg, I can stand it; yes, I can.”

As for Peleg himself, he took it more like a philosopher; but for all his philosophy, there was a tear twinkling in his eye, when the lantern came too near. And he, too, did not a little run from cabin to deck—now a word below, and now a word with Starbuck, the chief mate.

But, at last, he turned to his comrade, with a final sort of look about him,—“Captain Bildad—come, old shipmate, we must go. Back the main-yard there! Boat ahoy! Stand by to come close alongside, now! Careful, careful!—come, Bildad, boy—say your last. Luck to ye, Starbuck—luck to ye, Mr. Stubb—luck to ye, Mr. Flask—good-bye and good luck to ye all—and this day three years I’ll have a hot supper smoking for ye in old Nantucket. Hurrah and away!”

“God bless ye, and have ye in His holy keeping, men,” murmured old Bildad, almost incoherently. “I hope ye’ll have fine weather now, so that Captain Ahab may soon be moving among ye—a pleasant sun is all he needs, and ye’ll have plenty of them in the tropic voyage ye go. Be careful in the hunt, ye mates. Don’t stave the boats needlessly, ye harpooneers; good white cedar plank is raised full three per cent. within the year. Don’t forget your prayers, either. Mr. Starbuck, mind that cooper don’t waste the spare staves. Oh! the sail-needles are in the green locker! Don’t whale it too much a’ Lord’s days, men; but don’t miss a fair chance either, that’s rejecting Heaven’s good gifts. Have an eye to the molasses tierce, Mr. Stubb; it was a little leaky, I thought. If ye touch at the islands, Mr. Flask, beware of fornication. Good-bye, good-bye! Don’t keep that cheese too long down in the hold, Mr. Starbuck; it’ll spoil. Be careful with the butter—twenty cents the pound it was, and mind ye, if—”

“Come, come, Captain Bildad; stop palavering,—away!” and with that, Peleg hurried him over the side, and both dropt into the boat.

Ship and boat diverged; the cold, damp night breeze blew between; a screaming gull flew overhead; the two hulls wildly rolled; we gave three heavy-hearted cheers, and blindly plunged like fate into the lone Atlantic.






CHAPTER 23. The Lee Shore.
Some chapters back, one Bulkington was spoken of, a tall, newlanded mariner, encountered in New Bedford at the inn.

When on that shivering winter’s night, the Pequod thrust her vindictive bows into the cold malicious waves, who should I see standing at her helm but Bulkington! I looked with sympathetic awe and fearfulness upon the man, who in mid-winter just landed from a four years’ dangerous voyage, could so unrestingly push off again for still another tempestuous term. The land seemed scorching to his feet. Wonderfullest things are ever the unmentionable; deep memories yield no epitaphs; this six-inch chapter is the stoneless grave of Bulkington. Let me only say that it fared with him as with the storm-tossed ship, that miserably drives along the leeward land. The port would fain give succor; the port is pitiful; in the port is safety, comfort, hearthstone, supper, warm blankets, friends, all that’s kind to our mortalities. But in that gale, the port, the land, is that ship’s direst jeopardy; she must fly all hospitality; one touch of land, though it but graze the keel, would make her shudder through and through. With all her might she crowds all sail off shore; in so doing, fights ’gainst the very winds that fain would blow her homeward; seeks all the lashed sea’s landlessness again; for refuge’s sake forlornly rushing into peril; her only friend her bitterest foe!

Know ye now, Bulkington? Glimpses do ye seem to see of that mortally intolerable truth; that all deep, earnest thinking is but the intrepid effort of the soul to keep the open independence of her sea; while the wildest winds of heaven and earth conspire to cast her on the treacherous, slavish shore?

But as in landlessness alone resides highest truth, shoreless, indefinite as God—so, better is it to perish in that howling infinite, than be ingloriously dashed upon the lee, even if that were safety! For worm-like, then, oh! who would craven crawl to land! Terrors of the terrible! is all this agony so vain? Take heart, take heart, O Bulkington! Bear thee grimly, demigod! Up from the spray of thy ocean-perishing—straight up, leaps thy apotheosis!






CHAPTER 24. The Advocate.
As Queequeg and I are now fairly embarked in this business of whaling; and as this business of whaling has somehow come to be regarded among landsmen as a rather unpoetical and disreputable pursuit; therefore, I am all anxiety to convince ye, ye landsmen, of the injustice hereby done to us hunters of whales.

In the first place, it may be deemed almost superfluous to establish the fact, that among people at large, the business of whaling is not accounted on a level with what are called the liberal professions. If a stranger were introduced into any miscellaneous metropolitan society, it would but slightly advance the general opinion of his merits, were he presented to the company as a harpooneer, say; and if in emulation of the naval officers he should append the initials S.W.F. (Sperm Whale Fishery) to his visiting card, such a procedure would be deemed pre-eminently presuming and ridiculous.

Doubtless one leading reason why the world declines honoring us whalemen, is this: they think that, at best, our vocation amounts to a butchering sort of business; and that when actively engaged therein, we are surrounded by all manner of defilements. Butchers we are, that is true. But butchers, also, and butchers of the bloodiest badge have been all Martial Commanders whom the world invariably delights to honor. And as for the matter of the alleged uncleanliness of our business, ye shall soon be initiated into certain facts hitherto pretty generally unknown, and which, upon the whole, will triumphantly plant the sperm whale-ship at least among the cleanliest things of this tidy earth. But even granting the charge in question to be true; what disordered slippery decks of a whale-ship are comparable to the unspeakable carrion of those battle-fields from which so many soldiers return to drink in all ladies’ plaudits? And if the idea of peril so much enhances the popular conceit of the soldier’s profession; let me assure ye that many a veteran who has freely marched up to a battery, would quickly recoil at the apparition of the sperm whale’s vast tail, fanning into eddies the air over his head. For what are the comprehensible terrors of man compared with the interlinked terrors and wonders of God!

But, though the world scouts at us whale hunters, yet does it unwittingly pay us the profoundest homage; yea, an all-abounding adoration! for almost all the tapers, lamps, and candles that burn round the globe, burn, as before so many shrines, to our glory!

But look at this matter in other lights; weigh it in all sorts of scales; see what we whalemen are, and have been.

Why did the Dutch in De Witt’s time have admirals of their whaling fleets? Why did Louis XVI. of France, at his own personal expense, fit out whaling ships from Dunkirk, and politely invite to that town some score or two of families from our own island of Nantucket? Why did Britain between the years 1750 and 1788 pay to her whalemen in bounties upwards of £1,000,000? And lastly, how comes it that we whalemen of America now outnumber all the rest of the banded whalemen in the world; sail a navy of upwards of seven hundred vessels; manned by eighteen thousand men; yearly consuming 4,000,000 of dollars; the ships worth, at the time of sailing, $20,000,000! and every year importing into our harbors a well reaped harvest of $7,000,000. How comes all this, if there be not something puissant in whaling?

But this is not the half; look again.

I freely assert, that the cosmopolite philosopher cannot, for his life, point out one single peaceful influence, which within the last sixty years has operated more potentially upon the whole broad world, taken in one aggregate, than the high and mighty business of whaling. One way and another, it has begotten events so remarkable in themselves, and so continuously momentous in their sequential issues, that whaling may well be regarded as that Egyptian mother, who bore offspring themselves pregnant from her womb. It would be a hopeless, endless task to catalogue all these things. Let a handful suffice. For many years past the whale-ship has been the pioneer in ferreting out the remotest and least known parts of the earth. She has explored seas and archipelagoes which had no chart, where no Cook or Vancouver had ever sailed. If American and European men-of-war now peacefully ride in once savage harbors, let them fire salutes to the honor and glory of the whale-ship, which originally showed them the way, and first interpreted between them and the savages. They may celebrate as they will the heroes of Exploring Expeditions, your Cooks, your Krusensterns; but I say that scores of anonymous Captains have sailed out of Nantucket, that were as great, and greater than your Cook and your Krusenstern. For in their succourless empty-handedness, they, in the heathenish sharked waters, and by the beaches of unrecorded, javelin islands, battled with virgin wonders and terrors that Cook with all his marines and muskets would not willingly have dared. All that is made such a flourish of in the old South Sea Voyages, those things were but the life-time commonplaces of our heroic Nantucketers. Often, adventures which Vancouver dedicates three chapters to, these men accounted unworthy of being set down in the ship’s common log. Ah, the world! Oh, the world!

Until the whale fishery rounded Cape Horn, no commerce but colonial, scarcely any intercourse but colonial, was carried on between Europe and the long line of the opulent Spanish provinces on the Pacific coast. It was the whaleman who first broke through the jealous policy of the Spanish crown, touching those colonies; and, if space permitted, it might be distinctly shown how from those whalemen at last eventuated the liberation of Peru, Chili, and Bolivia from the yoke of Old Spain, and the establishment of the eternal democracy in those parts.

That great America on the other side of the sphere, Australia, was given to the enlightened world by the whaleman. After its first blunder-born discovery by a Dutchman, all other ships long shunned those shores as pestiferously barbarous; but the whale-ship touched there. The whale-ship is the true mother of that now mighty colony. Moreover, in the infancy of the first Australian settlement, the emigrants were several times saved from starvation by the benevolent biscuit of the whale-ship luckily dropping an anchor in their waters. The uncounted isles of all Polynesia confess the same truth, and do commercial homage to the whale-ship, that cleared the way for the missionary and the merchant, and in many cases carried the primitive missionaries to their first destinations. If that double-bolted land, Japan, is ever to become hospitable, it is the whale-ship alone to whom the credit will be due; for already she is on the threshold.

But if, in the face of all this, you still declare that whaling has no æsthetically noble associations connected with it, then am I ready to shiver fifty lances with you there, and unhorse you with a split helmet every time.

The whale has no famous author, and whaling no famous chronicler, you will say.

The whale no famous author, and whaling no famous chronicler? Who wrote the first account of our Leviathan? Who but mighty Job! And who composed the first narrative of a whaling-voyage? Who, but no less a prince than Alfred the Great, who, with his own royal pen, took down the words from Other, the Norwegian whale-hunter of those times! And who pronounced our glowing eulogy in Parliament? Who, but Edmund Burke!

True enough, but then whalemen themselves are poor devils; they have no good blood in their veins.

No good blood in their veins? They have something better than royal blood there. The grandmother of Benjamin Franklin was Mary Morrel; afterwards, by marriage, Mary Folger, one of the old settlers of Nantucket, and the ancestress to a long line of Folgers and harpooneers—all kith and kin to noble Benjamin—this day darting the barbed iron from one side of the world to the other.

Good again; but then all confess that somehow whaling is not respectable.

Whaling not respectable? Whaling is imperial! By old English statutory law, the whale is declared “a royal fish.” *

Oh, that’s only nominal! The whale himself has never figured in any grand imposing way.

The whale never figured in any grand imposing way? In one of the mighty triumphs given to a Roman general upon his entering the world’s capital, the bones of a whale, brought all the way from the Syrian coast, were the most conspicuous object in the cymballed procession.*

*See subsequent chapters for something more on this head.

Grant it, since you cite it; but, say what you will, there is no real dignity in whaling.

No dignity in whaling? The dignity of our calling the very heavens attest. Cetus is a constellation in the South! No more! Drive down your hat in presence of the Czar, and take it off to Queequeg! No more! I know a man that, in his lifetime, has taken three hundred and fifty whales. I account that man more honorable than that great captain of antiquity who boasted of taking as many walled towns.

And, as for me, if, by any possibility, there be any as yet undiscovered prime thing in me; if I shall ever deserve any real repute in that small but high hushed world which I might not be unreasonably ambitious of; if hereafter I shall do anything that, upon the whole, a man might rather have done than to have left undone; if, at my death, my executors, or more properly my creditors, find any precious MSS. in my desk, then here I prospectively ascribe all the honor and the glory to whaling; for a whale-ship was my Yale College and my Harvard.






CHAPTER 25. Postscript.
In behalf of the dignity of whaling, I would fain advance naught but substantiated facts. But after embattling his facts, an advocate who should wholly suppress a not unreasonable surmise, which might tell eloquently upon his cause—such an advocate, would he not be blameworthy?

It is well known that at the coronation of kings and queens, even modern ones, a certain curious process of seasoning them for their functions is gone through. There is a saltcellar of state, so called, and there may be a castor of state. How they use the salt, precisely—who knows? Certain I am, however, that a king’s head is solemnly oiled at his coronation, even as a head of salad. Can it be, though, that they anoint it with a view of making its interior run well, as they anoint machinery? Much might be ruminated here, concerning the essential dignity of this regal process, because in common life we esteem but meanly and contemptibly a fellow who anoints his hair, and palpably smells of that anointing. In truth, a mature man who uses hair-oil, unless medicinally, that man has probably got a quoggy spot in him somewhere. As a general rule, he can’t amount to much in his totality.

But the only thing to be considered here, is this—what kind of oil is used at coronations? Certainly it cannot be olive oil, nor macassar oil, nor castor oil, nor bear’s oil, nor train oil, nor cod-liver oil. What then can it possibly be, but sperm oil in its unmanufactured, unpolluted state, the sweetest of all oils?

Think of that, ye loyal Britons! we whalemen supply your kings and queens with coronation stuff!






CHAPTER 26. Knights and Squires.
The chief mate of the Pequod was Starbuck, a native of Nantucket, and a Quaker by descent. He was a long, earnest man, and though born on an icy coast, seemed well adapted to endure hot latitudes, his flesh being hard as twice-baked biscuit. Transported to the Indies, his live blood would not spoil like bottled ale. He must have been born in some time of general drought and famine, or upon one of those fast days for which his state is famous. Only some thirty arid summers had he seen; those summers had dried up all his physical superfluousness. But this, his thinness, so to speak, seemed no more the token of wasting anxieties and cares, than it seemed the indication of any bodily blight. It was merely the condensation of the man. He was by no means ill-looking; quite the contrary. His pure tight skin was an excellent fit; and closely wrapped up in it, and embalmed with inner health and strength, like a revivified Egyptian, this Starbuck seemed prepared to endure for long ages to come, and to endure always, as now; for be it Polar snow or torrid sun, like a patent chronometer, his interior vitality was warranted to do well in all climates. Looking into his eyes, you seemed to see there the yet lingering images of those thousand-fold perils he had calmly confronted through life. A staid, steadfast man, whose life for the most part was a telling pantomime of action, and not a tame chapter of sounds. Yet, for all his hardy sobriety and fortitude, there were certain qualities in him which at times affected, and in some cases seemed well nigh to overbalance all the rest. Uncommonly conscientious for a seaman, and endued with a deep natural reverence, the wild watery loneliness of his life did therefore strongly incline him to superstition; but to that sort of superstition, which in some organizations seems rather to spring, somehow, from intelligence than from ignorance. Outward portents and inward presentiments were his. And if at times these things bent the welded iron of his soul, much more did his far-away domestic memories of his young Cape wife and child, tend to bend him still more from the original ruggedness of his nature, and open him still further to those latent influences which, in some honest-hearted men, restrain the gush of dare-devil daring, so often evinced by others in the more perilous vicissitudes of the fishery. “I will have no man in my boat,” said Starbuck, “who is not afraid of a whale.” By this, he seemed to mean, not only that the most reliable and useful courage was that which arises from the fair estimation of the encountered peril, but that an utterly fearless man is a far more dangerous comrade than a coward.

“Aye, aye,” said Stubb, the second mate, “Starbuck, there, is as careful a man as you’ll find anywhere in this fishery.” But we shall ere long see what that word “careful” precisely means when used by a man like Stubb, or almost any other whale hunter.

Starbuck was no crusader after perils; in him courage was not a sentiment; but a thing simply useful to him, and always at hand upon all mortally practical occasions. Besides, he thought, perhaps, that in this business of whaling, courage was one of the great staple outfits of the ship, like her beef and her bread, and not to be foolishly wasted. Wherefore he had no fancy for lowering for whales after sun-down; nor for persisting in fighting a fish that too much persisted in fighting him. For, thought Starbuck, I am here in this critical ocean to kill whales for my living, and not to be killed by them for theirs; and that hundreds of men had been so killed Starbuck well knew. What doom was his own father’s? Where, in the bottomless deeps, could he find the torn limbs of his brother?

With memories like these in him, and, moreover, given to a certain superstitiousness, as has been said; the courage of this Starbuck which could, nevertheless, still flourish, must indeed have been extreme. But it was not in reasonable nature that a man so organized, and with such terrible experiences and remembrances as he had; it was not in nature that these things should fail in latently engendering an element in him, which, under suitable circumstances, would break out from its confinement, and burn all his courage up. And brave as he might be, it was that sort of bravery chiefly, visible in some intrepid men, which, while generally abiding firm in the conflict with seas, or winds, or whales, or any of the ordinary irrational horrors of the world, yet cannot withstand those more terrific, because more spiritual terrors, which sometimes menace you from the concentrating brow of an enraged and mighty man.

But were the coming narrative to reveal in any instance, the complete abasement of poor Starbuck’s fortitude, scarce might I have the heart to write it; for it is a thing most sorrowful, nay shocking, to expose the fall of valour in the soul. Men may seem detestable as joint stock-companies and nations; knaves, fools, and murderers there may be; men may have mean and meagre faces; but man, in the ideal, is so noble and so sparkling, such a grand and glowing creature, that over any ignominious blemish in him all his fellows should run to throw their costliest robes. That immaculate manliness we feel within ourselves, so far within us, that it remains intact though all the outer character seem gone; bleeds with keenest anguish at the undraped spectacle of a valor-ruined man. Nor can piety itself, at such a shameful sight, completely stifle her upbraidings against the permitting stars. But this august dignity I treat of, is not the dignity of kings and robes, but that abounding dignity which has no robed investiture. Thou shalt see it shining in the arm that wields a pick or drives a spike; that democratic dignity which, on all hands, radiates without end from God; Himself! The great God absolute! The centre and circumference of all democracy! His omnipresence, our divine equality!

If, then, to meanest mariners, and renegades and castaways, I shall hereafter ascribe high qualities, though dark; weave round them tragic graces; if even the most mournful, perchance the most abased, among them all, shall at times lift himself to the exalted mounts; if I shall touch that workman’s arm with some ethereal light; if I shall spread a rainbow over his disastrous set of sun; then against all mortal critics bear me out in it, thou just Spirit of Equality, which hast spread one royal mantle of humanity over all my kind! Bear me out in it, thou great democratic God! who didst not refuse to the swart convict, Bunyan, the pale, poetic pearl; Thou who didst clothe with doubly hammered leaves of finest gold, the stumped and paupered arm of old Cervantes; Thou who didst pick up Andrew Jackson from the pebbles; who didst hurl him upon a war-horse; who didst thunder him higher than a throne! Thou who, in all Thy mighty, earthly marchings, ever cullest Thy selectest champions from the kingly commons; bear me out in it, O God!






CHAPTER 27. Knights and Squires.
Stubb was the second mate. He was a native of Cape Cod; and hence, according to local usage, was called a Cape-Cod-man. A happy-go-lucky; neither craven nor valiant; taking perils as they came with an indifferent air; and while engaged in the most imminent crisis of the chase, toiling away, calm and collected as a journeyman joiner engaged for the year. Good-humored, easy, and careless, he presided over his whale-boat as if the most deadly encounter were but a dinner, and his crew all invited guests. He was as particular about the comfortable arrangement of his part of the boat, as an old stage-driver is about the snugness of his box. When close to the whale, in the very death-lock of the fight, he handled his unpitying lance coolly and off-handedly, as a whistling tinker his hammer. He would hum over his old rigadig tunes while flank and flank with the most exasperated monster. Long usage had, for this Stubb, converted the jaws of death into an easy chair. What he thought of death itself, there is no telling. Whether he ever thought of it at all, might be a question; but, if he ever did chance to cast his mind that way after a comfortable dinner, no doubt, like a good sailor, he took it to be a sort of call of the watch to tumble aloft, and bestir themselves there, about something which he would find out when he obeyed the order, and not sooner.

What, perhaps, with other things, made Stubb such an easy-going, unfearing man, so cheerily trudging off with the burden of life in a world full of grave pedlars, all bowed to the ground with their packs; what helped to bring about that almost impious good-humor of his; that thing must have been his pipe. For, like his nose, his short, black little pipe was one of the regular features of his face. You would almost as soon have expected him to turn out of his bunk without his nose as without his pipe. He kept a whole row of pipes there ready loaded, stuck in a rack, within easy reach of his hand; and, whenever he turned in, he smoked them all out in succession, lighting one from the other to the end of the chapter; then loading them again to be in readiness anew. For, when Stubb dressed, instead of first putting his legs into his trowsers, he put his pipe into his mouth.

I say this continual smoking must have been one cause, at least, of his peculiar disposition; for every one knows that this earthly air, whether ashore or afloat, is terribly infected with the nameless miseries of the numberless mortals who have died exhaling it; and as in time of the cholera, some people go about with a camphorated handkerchief to their mouths; so, likewise, against all mortal tribulations, Stubb’s tobacco smoke might have operated as a sort of disinfecting agent.

The third mate was Flask, a native of Tisbury, in Martha’s Vineyard. A short, stout, ruddy young fellow, very pugnacious concerning whales, who somehow seemed to think that the great leviathans had personally and hereditarily affronted him; and therefore it was a sort of point of honor with him, to destroy them whenever encountered. So utterly lost was he to all sense of reverence for the many marvels of their majestic bulk and mystic ways; and so dead to anything like an apprehension of any possible danger from encountering them; that in his poor opinion, the wondrous whale was but a species of magnified mouse, or at least water-rat, requiring only a little circumvention and some small application of time and trouble in order to kill and boil. This ignorant, unconscious fearlessness of his made him a little waggish in the matter of whales; he followed these fish for the fun of it; and a three years’ voyage round Cape Horn was only a jolly joke that lasted that length of time. As a carpenter’s nails are divided into wrought nails and cut nails; so mankind may be similarly divided. Little Flask was one of the wrought ones; made to clinch tight and last long. They called him King-Post on board of the Pequod; because, in form, he could be well likened to the short, square timber known by that name in Arctic whalers; and which by the means of many radiating side timbers inserted into it, serves to brace the ship against the icy concussions of those battering seas.

Now these three mates—Starbuck, Stubb, and Flask, were momentous men. They it was who by universal prescription commanded three of the Pequod’s boats as headsmen. In that grand order of battle in which Captain Ahab would probably marshal his forces to descend on the whales, these three headsmen were as captains of companies. Or, being armed with their long keen whaling spears, they were as a picked trio of lancers; even as the harpooneers were flingers of javelins.

And since in this famous fishery, each mate or headsman, like a Gothic Knight of old, is always accompanied by his boat-steerer or harpooneer, who in certain conjunctures provides him with a fresh lance, when the former one has been badly twisted, or elbowed in the assault; and moreover, as there generally subsists between the two, a close intimacy and friendliness; it is therefore but meet, that in this place we set down who the Pequod’s harpooneers were, and to what headsman each of them belonged.

First of all was Queequeg, whom Starbuck, the chief mate, had selected for his squire. But Queequeg is already known.

Next was Tashtego, an unmixed Indian from Gay Head, the most westerly promontory of Martha’s Vineyard, where there still exists the last remnant of a village of red men, which has long supplied the neighboring island of Nantucket with many of her most daring harpooneers. In the fishery, they usually go by the generic name of Gay-Headers. Tashtego’s long, lean, sable hair, his high cheek bones, and black rounding eyes—for an Indian, Oriental in their largeness, but Antarctic in their glittering expression—all this sufficiently proclaimed him an inheritor of the unvitiated blood of those proud warrior hunters, who, in quest of the great New England moose, had scoured, bow in hand, the aboriginal forests of the main. But no longer snuffing in the trail of the wild beasts of the woodland, Tashtego now hunted in the wake of the great whales of the sea; the unerring harpoon of the son fitly replacing the infallible arrow of the sires. To look at the tawny brawn of his lithe snaky limbs, you would almost have credited the superstitions of some of the earlier Puritans, and half-believed this wild Indian to be a son of the Prince of the Powers of the Air. Tashtego was Stubb the second mate’s squire.

Third among the harpooneers was Daggoo, a gigantic, coal-black negro-savage, with a lion-like tread—an Ahasuerus to behold. Suspended from his ears were two golden hoops, so large that the sailors called them ring-bolts, and would talk of securing the top-sail halyards to them. In his youth Daggoo had voluntarily shipped on board of a whaler, lying in a lonely bay on his native coast. And never having been anywhere in the world but in Africa, Nantucket, and the pagan harbors most frequented by whalemen; and having now led for many years the bold life of the fishery in the ships of owners uncommonly heedful of what manner of men they shipped; Daggoo retained all his barbaric virtues, and erect as a giraffe, moved about the decks in all the pomp of six feet five in his socks. There was a corporeal humility in looking up at him; and a white man standing before him seemed a white flag come to beg truce of a fortress. Curious to tell, this imperial negro, Ahasuerus Daggoo, was the Squire of little Flask, who looked like a chess-man beside him. As for the residue of the Pequod’s company, be it said, that at the present day not one in two of the many thousand men before the mast employed in the American whale fishery, are Americans born, though pretty nearly all the officers are. Herein it is the same with the American whale fishery as with the American army and military and merchant navies, and the engineering forces employed in the construction of the American Canals and Railroads. The same, I say, because in all these cases the native American liberally provides the brains, the rest of the world as generously supplying the muscles. No small number of these whaling seamen belong to the Azores, where the outward bound Nantucket whalers frequently touch to augment their crews from the hardy peasants of those rocky shores. In like manner, the Greenland whalers sailing out of Hull or London, put in at the Shetland Islands, to receive the full complement of their crew. Upon the passage homewards, they drop them there again. How it is, there is no telling, but Islanders seem to make the best whalemen. They were nearly all Islanders in the Pequod, Isolatoes too, I call such, not acknowledging the common continent of men, but each Isolato living on a separate continent of his own. Yet now, federated along one keel, what a set these Isolatoes were! An Anacharsis Clootz deputation from all the isles of the sea, and all the ends of the earth, accompanying Old Ahab in the Pequod to lay the world’s grievances before that bar from which not very many of them ever come back. Black Little Pip—he never did—oh, no! he went before. Poor Alabama boy! On the grim Pequod’s forecastle, ye shall ere long see him, beating his tambourine; prelusive of the eternal time, when sent for, to the great quarter-deck on high, he was bid strike in with angels, and beat his tambourine in glory; called a coward here, hailed a hero there!






CHAPTER 28. Ahab.
For several days after leaving Nantucket, nothing above hatches was seen of Captain Ahab. The mates regularly relieved each other at the watches, and for aught that could be seen to the contrary, they seemed to be the only commanders of the ship; only they sometimes issued from the cabin with orders so sudden and peremptory, that after all it was plain they but commanded vicariously. Yes, their supreme lord and dictator was there, though hitherto unseen by any eyes not permitted to penetrate into the now sacred retreat of the cabin.

Every time I ascended to the deck from my watches below, I instantly gazed aft to mark if any strange face were visible; for my first vague disquietude touching the unknown captain, now in the seclusion of the sea, became almost a perturbation. This was strangely heightened at times by the ragged Elijah’s diabolical incoherences uninvitedly recurring to me, with a subtle energy I could not have before conceived of. But poorly could I withstand them, much as in other moods I was almost ready to smile at the solemn whimsicalities of that outlandish prophet of the wharves. But whatever it was of apprehensiveness or uneasiness—to call it so—which I felt, yet whenever I came to look about me in the ship, it seemed against all warrantry to cherish such emotions. For though the harpooneers, with the great body of the crew, were a far more barbaric, heathenish, and motley set than any of the tame merchant-ship companies which my previous experiences had made me acquainted with, still I ascribed this—and rightly ascribed it—to the fierce uniqueness of the very nature of that wild Scandinavian vocation in which I had so abandonedly embarked. But it was especially the aspect of the three chief officers of the ship, the mates, which was most forcibly calculated to allay these colourless misgivings, and induce confidence and cheerfulness in every presentment of the voyage. Three better, more likely sea-officers and men, each in his own different way, could not readily be found, and they were every one of them Americans; a Nantucketer, a Vineyarder, a Cape man. Now, it being Christmas when the ship shot from out her harbor, for a space we had biting Polar weather, though all the time running away from it to the southward; and by every degree and minute of latitude which we sailed, gradually leaving that merciless winter, and all its intolerable weather behind us. It was one of those less lowering, but still grey and gloomy enough mornings of the transition, when with a fair wind the ship was rushing through the water with a vindictive sort of leaping and melancholy rapidity, that as I mounted to the deck at the call of the forenoon watch, so soon as I levelled my glance towards the taffrail, foreboding shivers ran over me. Reality outran apprehension; Captain Ahab stood upon his quarter-deck.

There seemed no sign of common bodily illness about him, nor of the recovery from any. He looked like a man cut away from the stake, when the fire has overrunningly wasted all the limbs without consuming them, or taking away one particle from their compacted aged robustness. His whole high, broad form, seemed made of solid bronze, and shaped in an unalterable mould, like Cellini’s cast Perseus. Threading its way out from among his grey hairs, and continuing right down one side of his tawny scorched face and neck, till it disappeared in his clothing, you saw a slender rod-like mark, lividly whitish. It resembled that perpendicular seam sometimes made in the straight, lofty trunk of a great tree, when the upper lightning tearingly darts down it, and without wrenching a single twig, peels and grooves out the bark from top to bottom, ere running off into the soil, leaving the tree still greenly alive, but branded. Whether that mark was born with him, or whether it was the scar left by some desperate wound, no one could certainly say. By some tacit consent, throughout the voyage little or no allusion was made to it, especially by the mates. But once Tashtego’s senior, an old Gay-Head Indian among the crew, superstitiously asserted that not till he was full forty years old did Ahab become that way branded, and then it came upon him, not in the fury of any mortal fray, but in an elemental strife at sea. Yet, this wild hint seemed inferentially negatived, by what a grey Manxman insinuated, an old sepulchral man, who, having never before sailed out of Nantucket, had never ere this laid eye upon wild Ahab. Nevertheless, the old sea-traditions, the immemorial credulities, popularly invested this old Manxman with preternatural powers of discernment. So that no white sailor seriously contradicted him when he said that if ever Captain Ahab should be tranquilly laid out—which might hardly come to pass, so he muttered—then, whoever should do that last office for the dead, would find a birth-mark on him from crown to sole.

So powerfully did the whole grim aspect of Ahab affect me, and the livid brand which streaked it, that for the first few moments I hardly noted that not a little of this overbearing grimness was owing to the barbaric white leg upon which he partly stood. It had previously come to me that this ivory leg had at sea been fashioned from the polished bone of the sperm whale’s jaw. “Aye, he was dismasted off Japan,” said the old Gay-Head Indian once; “but like his dismasted craft, he shipped another mast without coming home for it. He has a quiver of ’em.”

I was struck with the singular posture he maintained. Upon each side of the Pequod’s quarter deck, and pretty close to the mizzen shrouds, there was an auger hole, bored about half an inch or so, into the plank. His bone leg steadied in that hole; one arm elevated, and holding by a shroud; Captain Ahab stood erect, looking straight out beyond the ship’s ever-pitching prow. There was an infinity of firmest fortitude, a determinate, unsurrenderable wilfulness, in the fixed and fearless, forward dedication of that glance. Not a word he spoke; nor did his officers say aught to him; though by all their minutest gestures and expressions, they plainly showed the uneasy, if not painful, consciousness of being under a troubled master-eye. And not only that, but moody stricken Ahab stood before them with a crucifixion in his face; in all the nameless regal overbearing dignity of some mighty woe.

Ere long, from his first visit in the air, he withdrew into his cabin. But after that morning, he was every day visible to the crew; either standing in his pivot-hole, or seated upon an ivory stool he had; or heavily walking the deck. As the sky grew less gloomy; indeed, began to grow a little genial, he became still less and less a recluse; as if, when the ship had sailed from home, nothing but the dead wintry bleakness of the sea had then kept him so secluded. And, by and by, it came to pass, that he was almost continually in the air; but, as yet, for all that he said, or perceptibly did, on the at last sunny deck, he seemed as unnecessary there as another mast. But the Pequod was only making a passage now; not regularly cruising; nearly all whaling preparatives needing supervision the mates were fully competent to, so that there was little or nothing, out of himself, to employ or excite Ahab, now; and thus chase away, for that one interval, the clouds that layer upon layer were piled upon his brow, as ever all clouds choose the loftiest peaks to pile themselves upon.

Nevertheless, ere long, the warm, warbling persuasiveness of the pleasant, holiday weather we came to, seemed gradually to charm him from his mood. For, as when the red-cheeked, dancing girls, April and May, trip home to the wintry, misanthropic woods; even the barest, ruggedest, most thunder-cloven old oak will at least send forth some few green sprouts, to welcome such glad-hearted visitants; so Ahab did, in the end, a little respond to the playful allurings of that girlish air. More than once did he put forth the faint blossom of a look, which, in any other man, would have soon flowered out in a smile.






CHAPTER 29. Enter Ahab; to Him, Stubb.
Some days elapsed, and ice and icebergs all astern, the Pequod now went rolling through the bright Quito spring, which, at sea, almost perpetually reigns on the threshold of the eternal August of the Tropic. The warmly cool, clear, ringing, perfumed, overflowing, redundant days, were as crystal goblets of Persian sherbet, heaped up—flaked up, with rose-water snow. The starred and stately nights seemed haughty dames in jewelled velvets, nursing at home in lonely pride, the memory of their absent conquering Earls, the golden helmeted suns! For sleeping man, ’twas hard to choose between such winsome days and such seducing nights. But all the witcheries of that unwaning weather did not merely lend new spells and potencies to the outward world. Inward they turned upon the soul, especially when the still mild hours of eve came on; then, memory shot her crystals as the clear ice most forms of noiseless twilights. And all these subtle agencies, more and more they wrought on Ahab’s texture.

Old age is always wakeful; as if, the longer linked with life, the less man has to do with aught that looks like death. Among sea-commanders, the old greybeards will oftenest leave their berths to visit the night-cloaked deck. It was so with Ahab; only that now, of late, he seemed so much to live in the open air, that truly speaking, his visits were more to the cabin, than from the cabin to the planks. “It feels like going down into one’s tomb,”—he would mutter to himself—“for an old captain like me to be descending this narrow scuttle, to go to my grave-dug berth.”

So, almost every twenty-four hours, when the watches of the night were set, and the band on deck sentinelled the slumbers of the band below; and when if a rope was to be hauled upon the forecastle, the sailors flung it not rudely down, as by day, but with some cautiousness dropt it to its place for fear of disturbing their slumbering shipmates; when this sort of steady quietude would begin to prevail, habitually, the silent steersman would watch the cabin-scuttle; and ere long the old man would emerge, gripping at the iron banister, to help his crippled way. Some considering touch of humanity was in him; for at times like these, he usually abstained from patrolling the quarter-deck; because to his wearied mates, seeking repose within six inches of his ivory heel, such would have been the reverberating crack and din of that bony step, that their dreams would have been on the crunching teeth of sharks. But once, the mood was on him too deep for common regardings; and as with heavy, lumber-like pace he was measuring the ship from taffrail to mainmast, Stubb, the old second mate, came up from below, with a certain unassured, deprecating humorousness, hinted that if Captain Ahab was pleased to walk the planks, then, no one could say nay; but there might be some way of muffling the noise; hinting something indistinctly and hesitatingly about a globe of tow, and the insertion into it, of the ivory heel. Ah! Stubb, thou didst not know Ahab then.

“Am I a cannon-ball, Stubb,” said Ahab, “that thou wouldst wad me that fashion? But go thy ways; I had forgot. Below to thy nightly grave; where such as ye sleep between shrouds, to use ye to the filling one at last.—Down, dog, and kennel!”

Starting at the unforseen concluding exclamation of the so suddenly scornful old man, Stubb was speechless a moment; then said excitedly, “I am not used to be spoken to that way, sir; I do but less than half like it, sir.”

“Avast! gritted Ahab between his set teeth, and violently moving away, as if to avoid some passionate temptation.

“No, sir; not yet,” said Stubb, emboldened, “I will not tamely be called a dog, sir.”

“Then be called ten times a donkey, and a mule, and an ass, and begone, or I’ll clear the world of thee!”

As he said this, Ahab advanced upon him with such overbearing terrors in his aspect, that Stubb involuntarily retreated.

“I was never served so before without giving a hard blow for it,” muttered Stubb, as he found himself descending the cabin-scuttle. “It’s very queer. Stop, Stubb; somehow, now, I don’t well know whether to go back and strike him, or—what’s that?—down here on my knees and pray for him? Yes, that was the thought coming up in me; but it would be the first time I ever did pray. It’s queer; very queer; and he’s queer too; aye, take him fore and aft, he’s about the queerest old man Stubb ever sailed with. How he flashed at me!—his eyes like powder-pans! is he mad? Anyway there’s something on his mind, as sure as there must be something on a deck when it cracks. He aint in his bed now, either, more than three hours out of the twenty-four; and he don’t sleep then. Didn’t that Dough-Boy, the steward, tell me that of a morning he always finds the old man’s hammock clothes all rumpled and tumbled, and the sheets down at the foot, and the coverlid almost tied into knots, and the pillow a sort of frightful hot, as though a baked brick had been on it? A hot old man! I guess he’s got what some folks ashore call a conscience; it’s a kind of Tic-Dolly-row they say—worse nor a toothache. Well, well; I don’t know what it is, but the Lord keep me from catching it. He’s full of riddles; I wonder what he goes into the after hold for, every night, as Dough-Boy tells me he suspects; what’s that for, I should like to know? Who’s made appointments with him in the hold? Ain’t that queer, now? But there’s no telling, it’s the old game—Here goes for a snooze. Damn me, it’s worth a fellow’s while to be born into the world, if only to fall right asleep. And now that I think of it, that’s about the first thing babies do, and that’s a sort of queer, too. Damn me, but all things are queer, come to think of ’em. But that’s against my principles. Think not, is my eleventh commandment; and sleep when you can, is my twelfth—So here goes again. But how’s that? didn’t he call me a dog? blazes! he called me ten times a donkey, and piled a lot of jackasses on top of that! He might as well have kicked me, and done with it. Maybe he did kick me, and I didn’t observe it, I was so taken all aback with his brow, somehow. It flashed like a bleached bone. What the devil’s the matter with me? I don’t stand right on my legs. Coming afoul of that old man has a sort of turned me wrong side out. By the Lord, I must have been dreaming, though—How? how? how?—but the only way’s to stash it; so here goes to hammock again; and in the morning, I’ll see how this plaguey juggling thinks over by daylight.”






CHAPTER 30. The Pipe.
When Stubb had departed, Ahab stood for a while leaning over the bulwarks; and then, as had been usual with him of late, calling a sailor of the watch, he sent him below for his ivory stool, and also his pipe. Lighting the pipe at the binnacle lamp and planting the stool on the weather side of the deck, he sat and smoked.

In old Norse times, the thrones of the sea-loving Danish kings were fabricated, saith tradition, of the tusks of the narwhale. How could one look at Ahab then, seated on that tripod of bones, without bethinking him of the royalty it symbolized? For a Khan of the plank, and a king of the sea, and a great lord of Leviathans was Ahab.

Some moments passed, during which the thick vapor came from his mouth in quick and constant puffs, which blew back again into his face. “How now,” he soliloquized at last, withdrawing the tube, “this smoking no longer soothes. Oh, my pipe! hard must it go with me if thy charm be gone! Here have I been unconsciously toiling, not pleasuring—aye, and ignorantly smoking to windward all the while; to windward, and with such nervous whiffs, as if, like the dying whale, my final jets were the strongest and fullest of trouble. What business have I with this pipe? This thing that is meant for sereneness, to send up mild white vapors among mild white hairs, not among torn iron-grey locks like mine. I’ll smoke no more—”

He tossed the still lighted pipe into the sea. The fire hissed in the waves; the same instant the ship shot by the bubble the sinking pipe made. With slouched hat, Ahab lurchingly paced the planks.






CHAPTER 31. Queen Mab.
Next morning Stubb accosted Flask.

“Such a queer dream, King-Post, I never had. You know the old man’s ivory leg, well I dreamed he kicked me with it; and when I tried to kick back, upon my soul, my little man, I kicked my leg right off! And then, presto! Ahab seemed a pyramid, and I, like a blazing fool, kept kicking at it. But what was still more curious, Flask—you know how curious all dreams are—through all this rage that I was in, I somehow seemed to be thinking to myself, that after all, it was not much of an insult, that kick from Ahab. ‘Why,’ thinks I, ‘what’s the row? It’s not a real leg, only a false leg.’ And there’s a mighty difference between a living thump and a dead thump. That’s what makes a blow from the hand, Flask, fifty times more savage to bear than a blow from a cane. The living member—that makes the living insult, my little man. And thinks I to myself all the while, mind, while I was stubbing my silly toes against that cursed pyramid—so confoundedly contradictory was it all, all the while, I say, I was thinking to myself, ‘what’s his leg now, but a cane—a whalebone cane. Yes,’ thinks I, ‘it was only a playful cudgelling—in fact, only a whaleboning that he gave me—not a base kick. Besides,’ thinks I, ‘look at it once; why, the end of it—the foot part—what a small sort of end it is; whereas, if a broad footed farmer kicked me, there’s a devilish broad insult. But this insult is whittled down to a point only.’ But now comes the greatest joke of the dream, Flask. While I was battering away at the pyramid, a sort of badger-haired old merman, with a hump on his back, takes me by the shoulders, and slews me round. ‘What are you ’bout?’ says he. Slid! man, but I was frightened. Such a phiz! But, somehow, next moment I was over the fright. ‘What am I about?’ says I at last. ‘And what business is that of yours, I should like to know, Mr. Humpback? Do you want a kick?’ By the lord, Flask, I had no sooner said that, than he turned round his stern to me, bent over, and dragging up a lot of seaweed he had for a clout—what do you think, I saw?—why thunder alive, man, his stern was stuck full of marlinspikes, with the points out. Says I, on second thoughts, ‘I guess I won’t kick you, old fellow.’ ‘Wise Stubb,’ said he, ‘wise Stubb;’ and kept muttering it all the time, a sort of eating of his own gums like a chimney hag. Seeing he wasn’t going to stop saying over his ‘wise Stubb, wise Stubb,’ I thought I might as well fall to kicking the pyramid again. But I had only just lifted my foot for it, when he roared out, ‘Stop that kicking!’ ‘Halloa,’ says I, ‘what’s the matter now, old fellow?’ ‘Look ye here,’ says he; ‘let’s argue the insult. Captain Ahab kicked ye, didn’t he?’ ‘Yes, he did,’ says I—‘right here it was.’ ‘Very good,’ says he—‘he used his ivory leg, didn’t he?’ ‘Yes, he did,’ says I. ‘Well then,’ says he, ‘wise Stubb, what have you to complain of? Didn’t he kick with right good will? it wasn’t a common pitch pine leg he kicked with, was it? No, you were kicked by a great man, and with a beautiful ivory leg, Stubb. It’s an honor; I consider it an honor. Listen, wise Stubb. In old England the greatest lords think it great glory to be slapped by a queen, and made garter-knights of; but, be your boast, Stubb, that ye were kicked by old Ahab, and made a wise man of. Remember what I say; be kicked by him; account his kicks honors; and on no account kick back; for you can’t help yourself, wise Stubb. Don’t you see that pyramid?’ With that, he all of a sudden seemed somehow, in some queer fashion, to swim off into the air. I snored; rolled over; and there I was in my hammock! Now, what do you think of that dream, Flask?”

“I don’t know; it seems a sort of foolish to me, tho.’”

“May be; may be. But it’s made a wise man of me, Flask. D’ye see Ahab standing there, sideways looking over the stern? Well, the best thing you can do, Flask, is to let the old man alone; never speak to him, whatever he says. Halloa! What’s that he shouts? Hark!”

“Mast-head, there! Look sharp, all of ye! There are whales hereabouts!

“If ye see a white one, split your lungs for him!

“What do you think of that now, Flask? ain’t there a small drop of something queer about that, eh? A white whale—did ye mark that, man? Look ye—there’s something special in the wind. Stand by for it, Flask. Ahab has that that’s bloody on his mind. But, mum; he comes this way.”






CHAPTER 32. Cetology.
Already we are boldly launched upon the deep; but soon we shall be lost in its unshored, harbourless immensities. Ere that come to pass; ere the Pequod’s weedy hull rolls side by side with the barnacled hulls of the leviathan; at the outset it is but well to attend to a matter almost indispensable to a thorough appreciative understanding of the more special leviathanic revelations and allusions of all sorts which are to follow.

It is some systematized exhibition of the whale in his broad genera, that I would now fain put before you. Yet is it no easy task. The classification of the constituents of a chaos, nothing less is here essayed. Listen to what the best and latest authorities have laid down.

“No branch of Zoology is so much involved as that which is entitled Cetology,” says Captain Scoresby, A.D. 1820.

“It is not my intention, were it in my power, to enter into the inquiry as to the true method of dividing the cetacea into groups and families. * * * Utter confusion exists among the historians of this animal” (sperm whale), says Surgeon Beale, A.D. 1839.

“Unfitness to pursue our research in the unfathomable waters.” “Impenetrable veil covering our knowledge of the cetacea.” “A field strewn with thorns.” “All these incomplete indications but serve to torture us naturalists.”

Thus speak of the whale, the great Cuvier, and John Hunter, and Lesson, those lights of zoology and anatomy. Nevertheless, though of real knowledge there be little, yet of books there are a plenty; and so in some small degree, with cetology, or the science of whales. Many are the men, small and great, old and new, landsmen and seamen, who have at large or in little, written of the whale. Run over a few:—The Authors of the Bible; Aristotle; Pliny; Aldrovandi; Sir Thomas Browne; Gesner; Ray; Linnæus; Rondeletius; Willoughby; Green; Artedi; Sibbald; Brisson; Marten; Lacépède; Bonneterre; Desmarest; Baron Cuvier; Frederick Cuvier; John Hunter; Owen; Scoresby; Beale; Bennett; J. Ross Browne; the Author of Miriam Coffin; Olmstead; and the Rev. T. Cheever. But to what ultimate generalizing purpose all these have written, the above cited extracts will show.

Of the names in this list of whale authors, only those following Owen ever saw living whales; and but one of them was a real professional harpooneer and whaleman. I mean Captain Scoresby. On the separate subject of the Greenland or right-whale, he is the best existing authority. But Scoresby knew nothing and says nothing of the great sperm whale, compared with which the Greenland whale is almost unworthy mentioning. And here be it said, that the Greenland whale is an usurper upon the throne of the seas. He is not even by any means the largest of the whales. Yet, owing to the long priority of his claims, and the profound ignorance which, till some seventy years back, invested the then fabulous or utterly unknown sperm-whale, and which ignorance to this present day still reigns in all but some few scientific retreats and whale-ports; this usurpation has been every way complete. Reference to nearly all the leviathanic allusions in the great poets of past days, will satisfy you that the Greenland whale, without one rival, was to them the monarch of the seas. But the time has at last come for a new proclamation. This is Charing Cross; hear ye! good people all,—the Greenland whale is deposed,—the great sperm whale now reigneth!

There are only two books in being which at all pretend to put the living sperm whale before you, and at the same time, in the remotest degree succeed in the attempt. Those books are Beale’s and Bennett’s; both in their time surgeons to English South-Sea whale-ships, and both exact and reliable men. The original matter touching the sperm whale to be found in their volumes is necessarily small; but so far as it goes, it is of excellent quality, though mostly confined to scientific description. As yet, however, the sperm whale, scientific or poetic, lives not complete in any literature. Far above all other hunted whales, his is an unwritten life.

Now the various species of whales need some sort of popular comprehensive classification, if only an easy outline one for the present, hereafter to be filled in all its departments by subsequent laborers. As no better man advances to take this matter in hand, I hereupon offer my own poor endeavors. I promise nothing complete; because any human thing supposed to be complete, must for that very reason infallibly be faulty. I shall not pretend to a minute anatomical description of the various species, or—in this place at least—to much of any description. My object here is simply to project the draught of a systematization of cetology. I am the architect, not the builder.

But it is a ponderous task; no ordinary letter-sorter in the Post-Office is equal to it. To grope down into the bottom of the sea after them; to have one’s hands among the unspeakable foundations, ribs, and very pelvis of the world; this is a fearful thing. What am I that I should essay to hook the nose of this leviathan! The awful tauntings in Job might well appal me. Will he (the leviathan) make a covenant with thee? Behold the hope of him is vain! But I have swam through libraries and sailed through oceans; I have had to do with whales with these visible hands; I am in earnest; and I will try. There are some preliminaries to settle.

First: The uncertain, unsettled condition of this science of Cetology is in the very vestibule attested by the fact, that in some quarters it still remains a moot point whether a whale be a fish. In his System of Nature, A.D. 1776, Linnæus declares, “I hereby separate the whales from the fish.” But of my own knowledge, I know that down to the year 1850, sharks and shad, alewives and herring, against Linnæus’s express edict, were still found dividing the possession of the same seas with the Leviathan.

The grounds upon which Linnæus would fain have banished the whales from the waters, he states as follows: “On account of their warm bilocular heart, their lungs, their movable eyelids, their hollow ears, penem intrantem feminam mammis lactantem,” and finally, “ex lege naturæ jure meritoque.” I submitted all this to my friends Simeon Macey and Charley Coffin, of Nantucket, both messmates of mine in a certain voyage, and they united in the opinion that the reasons set forth were altogether insufficient. Charley profanely hinted they were humbug.

Be it known that, waiving all argument, I take the good old fashioned ground that the whale is a fish, and call upon holy Jonah to back me. This fundamental thing settled, the next point is, in what internal respect does the whale differ from other fish. Above, Linnæus has given you those items. But in brief, they are these: lungs and warm blood; whereas, all other fish are lungless and cold blooded.

Next: how shall we define the whale, by his obvious externals, so as conspicuously to label him for all time to come? To be short, then, a whale is a spouting fish with a horizontal tail. There you have him. However contracted, that definition is the result of expanded meditation. A walrus spouts much like a whale, but the walrus is not a fish, because he is amphibious. But the last term of the definition is still more cogent, as coupled with the first. Almost any one must have noticed that all the fish familiar to landsmen have not a flat, but a vertical, or up-and-down tail. Whereas, among spouting fish the tail, though it may be similarly shaped, invariably assumes a horizontal position.

By the above definition of what a whale is, I do by no means exclude from the leviathanic brotherhood any sea creature hitherto identified with the whale by the best informed Nantucketers; nor, on the other hand, link with it any fish hitherto authoritatively regarded as alien.* Hence, all the smaller, spouting, and horizontal tailed fish must be included in this ground-plan of Cetology. Now, then, come the grand divisions of the entire whale host.

*I am aware that down to the present time, the fish styled Lamatins and Dugongs (Pig-fish and Sow-fish of the Coffins of Nantucket) are included by many naturalists among the whales. But as these pig-fish are a noisy, contemptible set, mostly lurking in the mouths of rivers, and feeding on wet hay, and especially as they do not spout, I deny their credentials as whales; and have presented them with their passports to quit the Kingdom of Cetology.

First: According to magnitude I divide the whales into three primary BOOKS (subdivisible into CHAPTERS), and these shall comprehend them all, both small and large.

I. THE FOLIO WHALE; II. the OCTAVO WHALE; III. the DUODECIMO WHALE.

As the type of the FOLIO I present the Sperm Whale; of the OCTAVO, the Grampus; of the DUODECIMO, the Porpoise.

FOLIOS. Among these I here include the following chapters:—I. The Sperm Whale; II. the Right Whale; III. the Fin-Back Whale; IV. the Hump-backed Whale; V. the Razor Back Whale; VI. the Sulphur Bottom Whale.

BOOK I. (Folio), CHAPTER I. (Sperm Whale).—This whale, among the English of old vaguely known as the Trumpa whale, and the Physeter whale, and the Anvil Headed whale, is the present Cachalot of the French, and the Pottsfich of the Germans, and the Macrocephalus of the Long Words. He is, without doubt, the largest inhabitant of the globe; the most formidable of all whales to encounter; the most majestic in aspect; and lastly, by far the most valuable in commerce; he being the only creature from which that valuable substance, spermaceti, is obtained. All his peculiarities will, in many other places, be enlarged upon. It is chiefly with his name that I now have to do. Philologically considered, it is absurd. Some centuries ago, when the Sperm whale was almost wholly unknown in his own proper individuality, and when his oil was only accidentally obtained from the stranded fish; in those days spermaceti, it would seem, was popularly supposed to be derived from a creature identical with the one then known in England as the Greenland or Right Whale. It was the idea also, that this same spermaceti was that quickening humor of the Greenland Whale which the first syllable of the word literally expresses. In those times, also, spermaceti was exceedingly scarce, not being used for light, but only as an ointment and medicament. It was only to be had from the druggists as you nowadays buy an ounce of rhubarb. When, as I opine, in the course of time, the true nature of spermaceti became known, its original name was still retained by the dealers; no doubt to enhance its value by a notion so strangely significant of its scarcity. And so the appellation must at last have come to be bestowed upon the whale from which this spermaceti was really derived.

BOOK I. (Folio), CHAPTER II. (Right Whale).—In one respect this is the most venerable of the leviathans, being the one first regularly hunted by man. It yields the article commonly known as whalebone or baleen; and the oil specially known as “whale oil,” an inferior article in commerce. Among the fishermen, he is indiscriminately designated by all the following titles: The Whale; the Greenland Whale; the Black Whale; the Great Whale; the True Whale; the Right Whale. There is a deal of obscurity concerning the identity of the species thus multitudinously baptised. What then is the whale, which I include in the second species of my Folios? It is the Great Mysticetus of the English naturalists; the Greenland Whale of the English whalemen; the Baleine Ordinaire of the French whalemen; the Growlands Walfish of the Swedes. It is the whale which for more than two centuries past has been hunted by the Dutch and English in the Arctic seas; it is the whale which the American fishermen have long pursued in the Indian ocean, on the Brazil Banks, on the Nor’ West Coast, and various other parts of the world, designated by them Right Whale Cruising Grounds.

Some pretend to see a difference between the Greenland whale of the English and the right whale of the Americans. But they precisely agree in all their grand features; nor has there yet been presented a single determinate fact upon which to ground a radical distinction. It is by endless subdivisions based upon the most inconclusive differences, that some departments of natural history become so repellingly intricate. The right whale will be elsewhere treated of at some length, with reference to elucidating the sperm whale.

BOOK I. (Folio), CHAPTER III. (Fin-Back).—Under this head I reckon a monster which, by the various names of Fin-Back, Tall-Spout, and Long-John, has been seen almost in every sea and is commonly the whale whose distant jet is so often descried by passengers crossing the Atlantic, in the New York packet-tracks. In the length he attains, and in his baleen, the Fin-back resembles the right whale, but is of a less portly girth, and a lighter colour, approaching to olive. His great lips present a cable-like aspect, formed by the intertwisting, slanting folds of large wrinkles. His grand distinguishing feature, the fin, from which he derives his name, is often a conspicuous object. This fin is some three or four feet long, growing vertically from the hinder part of the back, of an angular shape, and with a very sharp pointed end. Even if not the slightest other part of the creature be visible, this isolated fin will, at times, be seen plainly projecting from the surface. When the sea is moderately calm, and slightly marked with spherical ripples, and this gnomon-like fin stands up and casts shadows upon the wrinkled surface, it may well be supposed that the watery circle surrounding it somewhat resembles a dial, with its style and wavy hour-lines graved on it. On that Ahaz-dial the shadow often goes back. The Fin-Back is not gregarious. He seems a whale-hater, as some men are man-haters. Very shy; always going solitary; unexpectedly rising to the surface in the remotest and most sullen waters; his straight and single lofty jet rising like a tall misanthropic spear upon a barren plain; gifted with such wondrous power and velocity in swimming, as to defy all present pursuit from man; this leviathan seems the banished and unconquerable Cain of his race, bearing for his mark that style upon his back. From having the baleen in his mouth, the Fin-Back is sometimes included with the right whale, among a theoretic species denominated Whalebone whales, that is, whales with baleen. Of these so called Whalebone whales, there would seem to be several varieties, most of which, however, are little known. Broad-nosed whales and beaked whales; pike-headed whales; bunched whales; under-jawed whales and rostrated whales, are the fishermen’s names for a few sorts.

In connection with this appellative of “Whalebone whales,” it is of great importance to mention, that however such a nomenclature may be convenient in facilitating allusions to some kind of whales, yet it is in vain to attempt a clear classification of the Leviathan, founded upon either his baleen, or hump, or fin, or teeth; notwithstanding that those marked parts or features very obviously seem better adapted to afford the basis for a regular system of Cetology than any other detached bodily distinctions, which the whale, in his kinds, presents. How then? The baleen, hump, back-fin, and teeth; these are things whose peculiarities are indiscriminately dispersed among all sorts of whales, without any regard to what may be the nature of their structure in other and more essential particulars. Thus, the sperm whale and the humpbacked whale, each has a hump; but there the similitude ceases. Then, this same humpbacked whale and the Greenland whale, each of these has baleen; but there again the similitude ceases. And it is just the same with the other parts above mentioned. In various sorts of whales, they form such irregular combinations; or, in the case of any one of them detached, such an irregular isolation; as utterly to defy all general methodization formed upon such a basis. On this rock every one of the whale-naturalists has split.

But it may possibly be conceived that, in the internal parts of the whale, in his anatomy—there, at least, we shall be able to hit the right classification. Nay; what thing, for example, is there in the Greenland whale’s anatomy more striking than his baleen? Yet we have seen that by his baleen it is impossible correctly to classify the Greenland whale. And if you descend into the bowels of the various leviathans, why there you will not find distinctions a fiftieth part as available to the systematizer as those external ones already enumerated. What then remains? nothing but to take hold of the whales bodily, in their entire liberal volume, and boldly sort them that way. And this is the Bibliographical system here adopted; and it is the only one that can possibly succeed, for it alone is practicable. To proceed.

BOOK I. (Folio) CHAPTER IV. (Hump Back).—This whale is often seen on the northern American coast. He has been frequently captured there, and towed into harbor. He has a great pack on him like a peddler; or you might call him the Elephant and Castle whale. At any rate, the popular name for him does not sufficiently distinguish him, since the sperm whale also has a hump though a smaller one. His oil is not very valuable. He has baleen. He is the most gamesome and light-hearted of all the whales, making more gay foam and white water generally than any other of them.

BOOK I. (Folio), CHAPTER V. (Razor Back).—Of this whale little is known but his name. I have seen him at a distance off Cape Horn. Of a retiring nature, he eludes both hunters and philosophers. Though no coward, he has never yet shown any part of him but his back, which rises in a long sharp ridge. Let him go. I know little more of him, nor does anybody else.

BOOK I. (Folio), CHAPTER VI. (Sulphur Bottom).—Another retiring gentleman, with a brimstone belly, doubtless got by scraping along the Tartarian tiles in some of his profounder divings. He is seldom seen; at least I have never seen him except in the remoter southern seas, and then always at too great a distance to study his countenance. He is never chased; he would run away with rope-walks of line. Prodigies are told of him. Adieu, Sulphur Bottom! I can say nothing more that is true of ye, nor can the oldest Nantucketer.

Thus ends BOOK I. (Folio), and now begins BOOK II. (Octavo).

OCTAVOES.*—These embrace the whales of middling magnitude, among which present may be numbered:—I., the Grampus; II., the Black Fish; III., the Narwhale; IV., the Thrasher; V., the Killer.

*Why this book of whales is not denominated the Quarto is very plain. Because, while the whales of this order, though smaller than those of the former order, nevertheless retain a proportionate likeness to them in figure, yet the bookbinder’s Quarto volume in its dimensioned form does not preserve the shape of the Folio volume, but the Octavo volume does.

BOOK II. (Octavo), CHAPTER I. (Grampus).—Though this fish, whose loud sonorous breathing, or rather blowing, has furnished a proverb to landsmen, is so well known a denizen of the deep, yet is he not popularly classed among whales. But possessing all the grand distinctive features of the leviathan, most naturalists have recognised him for one. He is of moderate octavo size, varying from fifteen to twenty-five feet in length, and of corresponding dimensions round the waist. He swims in herds; he is never regularly hunted, though his oil is considerable in quantity, and pretty good for light. By some fishermen his approach is regarded as premonitory of the advance of the great sperm whale.

BOOK II. (Octavo), CHAPTER II. (Black Fish).—I give the popular fishermen’s names for all these fish, for generally they are the best. Where any name happens to be vague or inexpressive, I shall say so, and suggest another. I do so now, touching the Black Fish, so-called, because blackness is the rule among almost all whales. So, call him the Hyena Whale, if you please. His voracity is well known, and from the circumstance that the inner angles of his lips are curved upwards, he carries an everlasting Mephistophelean grin on his face. This whale averages some sixteen or eighteen feet in length. He is found in almost all latitudes. He has a peculiar way of showing his dorsal hooked fin in swimming, which looks something like a Roman nose. When not more profitably employed, the sperm whale hunters sometimes capture the Hyena whale, to keep up the supply of cheap oil for domestic employment—as some frugal housekeepers, in the absence of company, and quite alone by themselves, burn unsavory tallow instead of odorous wax. Though their blubber is very thin, some of these whales will yield you upwards of thirty gallons of oil.

BOOK II. (Octavo), CHAPTER III. (Narwhale), that is, Nostril whale.—Another instance of a curiously named whale, so named I suppose from his peculiar horn being originally mistaken for a peaked nose. The creature is some sixteen feet in length, while its horn averages five feet, though some exceed ten, and even attain to fifteen feet. Strictly speaking, this horn is but a lengthened tusk, growing out from the jaw in a line a little depressed from the horizontal. But it is only found on the sinister side, which has an ill effect, giving its owner something analogous to the aspect of a clumsy left-handed man. What precise purpose this ivory horn or lance answers, it would be hard to say. It does not seem to be used like the blade of the sword-fish and bill-fish; though some sailors tell me that the Narwhale employs it for a rake in turning over the bottom of the sea for food. Charley Coffin said it was used for an ice-piercer; for the Narwhale, rising to the surface of the Polar Sea, and finding it sheeted with ice, thrusts his horn up, and so breaks through. But you cannot prove either of these surmises to be correct. My own opinion is, that however this one-sided horn may really be used by the Narwhale—however that may be—it would certainly be very convenient to him for a folder in reading pamphlets. The Narwhale I have heard called the Tusked whale, the Horned whale, and the Unicorn whale. He is certainly a curious example of the Unicornism to be found in almost every kingdom of animated nature. From certain cloistered old authors I have gathered that this same sea-unicorn’s horn was in ancient days regarded as the great antidote against poison, and as such, preparations of it brought immense prices. It was also distilled to a volatile salts for fainting ladies, the same way that the horns of the male deer are manufactured into hartshorn. Originally it was in itself accounted an object of great curiosity. Black Letter tells me that Sir Martin Frobisher on his return from that voyage, when Queen Bess did gallantly wave her jewelled hand to him from a window of Greenwich Palace, as his bold ship sailed down the Thames; “when Sir Martin returned from that voyage,” saith Black Letter, “on bended knees he presented to her highness a prodigious long horn of the Narwhale, which for a long period after hung in the castle at Windsor.” An Irish author avers that the Earl of Leicester, on bended knees, did likewise present to her highness another horn, pertaining to a land beast of the unicorn nature.

The Narwhale has a very picturesque, leopard-like look, being of a milk-white ground colour, dotted with round and oblong spots of black. His oil is very superior, clear and fine; but there is little of it, and he is seldom hunted. He is mostly found in the circumpolar seas.

BOOK II. (Octavo), CHAPTER IV. (Killer).—Of this whale little is precisely known to the Nantucketer, and nothing at all to the professed naturalist. From what I have seen of him at a distance, I should say that he was about the bigness of a grampus. He is very savage—a sort of Feegee fish. He sometimes takes the great Folio whales by the lip, and hangs there like a leech, till the mighty brute is worried to death. The Killer is never hunted. I never heard what sort of oil he has. Exception might be taken to the name bestowed upon this whale, on the ground of its indistinctness. For we are all killers, on land and on sea; Bonapartes and Sharks included.

BOOK II. (Octavo), CHAPTER V. (Thrasher).—This gentleman is famous for his tail, which he uses for a ferule in thrashing his foes. He mounts the Folio whale’s back, and as he swims, he works his passage by flogging him; as some schoolmasters get along in the world by a similar process. Still less is known of the Thrasher than of the Killer. Both are outlaws, even in the lawless seas.

Thus ends BOOK II. (Octavo), and begins BOOK III. (Duodecimo).

DUODECIMOES.—These include the smaller whales. I. The Huzza Porpoise. II. The Algerine Porpoise. III. The Mealy-mouthed Porpoise.

To those who have not chanced specially to study the subject, it may possibly seem strange, that fishes not commonly exceeding four or five feet should be marshalled among WHALES—a word, which, in the popular sense, always conveys an idea of hugeness. But the creatures set down above as Duodecimoes are infallibly whales, by the terms of my definition of what a whale is—i.e. a spouting fish, with a horizontal tail.

BOOK III. (Duodecimo), CHAPTER 1. (Huzza Porpoise).—This is the common porpoise found almost all over the globe. The name is of my own bestowal; for there are more than one sort of porpoises, and something must be done to distinguish them. I call him thus, because he always swims in hilarious shoals, which upon the broad sea keep tossing themselves to heaven like caps in a Fourth-of-July crowd. Their appearance is generally hailed with delight by the mariner. Full of fine spirits, they invariably come from the breezy billows to windward. They are the lads that always live before the wind. They are accounted a lucky omen. If you yourself can withstand three cheers at beholding these vivacious fish, then heaven help ye; the spirit of godly gamesomeness is not in ye. A well-fed, plump Huzza Porpoise will yield you one good gallon of good oil. But the fine and delicate fluid extracted from his jaws is exceedingly valuable. It is in request among jewellers and watchmakers. Sailors put it on their hones. Porpoise meat is good eating, you know. It may never have occurred to you that a porpoise spouts. Indeed, his spout is so small that it is not very readily discernible. But the next time you have a chance, watch him; and you will then see the great Sperm whale himself in miniature.

BOOK III. (Duodecimo), CHAPTER II. (Algerine Porpoise).—A pirate. Very savage. He is only found, I think, in the Pacific. He is somewhat larger than the Huzza Porpoise, but much of the same general make. Provoke him, and he will buckle to a shark. I have lowered for him many times, but never yet saw him captured.

BOOK III. (Duodecimo), CHAPTER III. (Mealy-mouthed Porpoise).—The largest kind of Porpoise; and only found in the Pacific, so far as it is known. The only English name, by which he has hitherto been designated, is that of the fishers—Right-Whale Porpoise, from the circumstance that he is chiefly found in the vicinity of that Folio. In shape, he differs in some degree from the Huzza Porpoise, being of a less rotund and jolly girth; indeed, he is of quite a neat and gentleman-like figure. He has no fins on his back (most other porpoises have), he has a lovely tail, and sentimental Indian eyes of a hazel hue. But his mealy-mouth spoils all. Though his entire back down to his side fins is of a deep sable, yet a boundary line, distinct as the mark in a ship’s hull, called the “bright waist,” that line streaks him from stem to stern, with two separate colours, black above and white below. The white comprises part of his head, and the whole of his mouth, which makes him look as if he had just escaped from a felonious visit to a meal-bag. A most mean and mealy aspect! His oil is much like that of the common porpoise.

* * * * * *

Beyond the DUODECIMO, this system does not proceed, inasmuch as the Porpoise is the smallest of the whales. Above, you have all the Leviathans of note. But there are a rabble of uncertain, fugitive, half-fabulous whales, which, as an American whaleman, I know by reputation, but not personally. I shall enumerate them by their fore-castle appellations; for possibly such a list may be valuable to future investigators, who may complete what I have here but begun. If any of the following whales, shall hereafter be caught and marked, then he can readily be incorporated into this System, according to his Folio, Octavo, or Duodecimo magnitude:—The Bottle-Nose Whale; the Junk Whale; the Pudding-Headed Whale; the Cape Whale; the Leading Whale; the Cannon Whale; the Scragg Whale; the Coppered Whale; the Elephant Whale; the Iceberg Whale; the Quog Whale; the Blue Whale; etc. From Icelandic, Dutch, and old English authorities, there might be quoted other lists of uncertain whales, blessed with all manner of uncouth names. But I omit them as altogether obsolete; and can hardly help suspecting them for mere sounds, full of Leviathanism, but signifying nothing.

Finally: It was stated at the outset, that this system would not be here, and at once, perfected. You cannot but plainly see that I have kept my word. But I now leave my cetological System standing thus unfinished, even as the great Cathedral of Cologne was left, with the crane still standing upon the top of the uncompleted tower. For small erections may be finished by their first architects; grand ones, true ones, ever leave the copestone to posterity. God keep me from ever completing anything. This whole book is but a draught—nay, but the draught of a draught. Oh, Time, Strength, Cash, and Patience!






CHAPTER 33. The Specksnyder.
Concerning the officers of the whale-craft, this seems as good a place as any to set down a little domestic peculiarity on ship-board, arising from the existence of the harpooneer class of officers, a class unknown of course in any other marine than the whale-fleet.

The large importance attached to the harpooneer’s vocation is evinced by the fact, that originally in the old Dutch Fishery, two centuries and more ago, the command of a whale ship was not wholly lodged in the person now called the captain, but was divided between him and an officer called the Specksnyder. Literally this word means Fat-Cutter; usage, however, in time made it equivalent to Chief Harpooneer. In those days, the captain’s authority was restricted to the navigation and general management of the vessel; while over the whale-hunting department and all its concerns, the Specksnyder or Chief Harpooneer reigned supreme. In the British Greenland Fishery, under the corrupted title of Specksioneer, this old Dutch official is still retained, but his former dignity is sadly abridged. At present he ranks simply as senior Harpooneer; and as such, is but one of the captain’s more inferior subalterns. Nevertheless, as upon the good conduct of the harpooneers the success of a whaling voyage largely depends, and since in the American Fishery he is not only an important officer in the boat, but under certain circumstances (night watches on a whaling ground) the command of the ship’s deck is also his; therefore the grand political maxim of the sea demands, that he should nominally live apart from the men before the mast, and be in some way distinguished as their professional superior; though always, by them, familiarly regarded as their social equal.

Now, the grand distinction drawn between officer and man at sea, is this—the first lives aft, the last forward. Hence, in whale-ships and merchantmen alike, the mates have their quarters with the captain; and so, too, in most of the American whalers the harpooneers are lodged in the after part of the ship. That is to say, they take their meals in the captain’s cabin, and sleep in a place indirectly communicating with it.

Though the long period of a Southern whaling voyage (by far the longest of all voyages now or ever made by man), the peculiar perils of it, and the community of interest prevailing among a company, all of whom, high or low, depend for their profits, not upon fixed wages, but upon their common luck, together with their common vigilance, intrepidity, and hard work; though all these things do in some cases tend to beget a less rigorous discipline than in merchantmen generally; yet, never mind how much like an old Mesopotamian family these whalemen may, in some primitive instances, live together; for all that, the punctilious externals, at least, of the quarter-deck are seldom materially relaxed, and in no instance done away. Indeed, many are the Nantucket ships in which you will see the skipper parading his quarter-deck with an elated grandeur not surpassed in any military navy; nay, extorting almost as much outward homage as if he wore the imperial purple, and not the shabbiest of pilot-cloth.

And though of all men the moody captain of the Pequod was the least given to that sort of shallowest assumption; and though the only homage he ever exacted, was implicit, instantaneous obedience; though he required no man to remove the shoes from his feet ere stepping upon the quarter-deck; and though there were times when, owing to peculiar circumstances connected with events hereafter to be detailed, he addressed them in unusual terms, whether of condescension or in terrorem, or otherwise; yet even Captain Ahab was by no means unobservant of the paramount forms and usages of the sea.

Nor, perhaps, will it fail to be eventually perceived, that behind those forms and usages, as it were, he sometimes masked himself; incidentally making use of them for other and more private ends than they were legitimately intended to subserve. That certain sultanism of his brain, which had otherwise in a good degree remained unmanifested; through those forms that same sultanism became incarnate in an irresistible dictatorship. For be a man’s intellectual superiority what it will, it can never assume the practical, available supremacy over other men, without the aid of some sort of external arts and entrenchments, always, in themselves, more or less paltry and base. This it is, that for ever keeps God’s true princes of the Empire from the world’s hustings; and leaves the highest honors that this air can give, to those men who become famous more through their infinite inferiority to the choice hidden handful of the Divine Inert, than through their undoubted superiority over the dead level of the mass. Such large virtue lurks in these small things when extreme political superstitions invest them, that in some royal instances even to idiot imbecility they have imparted potency. But when, as in the case of Nicholas the Czar, the ringed crown of geographical empire encircles an imperial brain; then, the plebeian herds crouch abased before the tremendous centralization. Nor, will the tragic dramatist who would depict mortal indomitableness in its fullest sweep and direct swing, ever forget a hint, incidentally so important in his art, as the one now alluded to.

But Ahab, my Captain, still moves before me in all his Nantucket grimness and shagginess; and in this episode touching Emperors and Kings, I must not conceal that I have only to do with a poor old whale-hunter like him; and, therefore, all outward majestical trappings and housings are denied me. Oh, Ahab! what shall be grand in thee, it must needs be plucked at from the skies, and dived for in the deep, and featured in the unbodied air!






CHAPTER 34. The Cabin-Table.
It is noon; and Dough-Boy, the steward, thrusting his pale loaf-of-bread face from the cabin-scuttle, announces dinner to his lord and master; who, sitting in the lee quarter-boat, has just been taking an observation of the sun; and is now mutely reckoning the latitude on the smooth, medallion-shaped tablet, reserved for that daily purpose on the upper part of his ivory leg. From his complete inattention to the tidings, you would think that moody Ahab had not heard his menial. But presently, catching hold of the mizen shrouds, he swings himself to the deck, and in an even, unexhilarated voice, saying, “Dinner, Mr. Starbuck,” disappears into the cabin.

When the last echo of his sultan’s step has died away, and Starbuck, the first Emir, has every reason to suppose that he is seated, then Starbuck rouses from his quietude, takes a few turns along the planks, and, after a grave peep into the binnacle, says, with some touch of pleasantness, “Dinner, Mr. Stubb,” and descends the scuttle. The second Emir lounges about the rigging awhile, and then slightly shaking the main brace, to see whether it will be all right with that important rope, he likewise takes up the old burden, and with a rapid “Dinner, Mr. Flask,” follows after his predecessors.

But the third Emir, now seeing himself all alone on the quarter-deck, seems to feel relieved from some curious restraint; for, tipping all sorts of knowing winks in all sorts of directions, and kicking off his shoes, he strikes into a sharp but noiseless squall of a hornpipe right over the Grand Turk’s head; and then, by a dexterous sleight, pitching his cap up into the mizentop for a shelf, he goes down rollicking so far at least as he remains visible from the deck, reversing all other processions, by bringing up the rear with music. But ere stepping into the cabin doorway below, he pauses, ships a new face altogether, and, then, independent, hilarious little Flask enters King Ahab’s presence, in the character of Abjectus, or the Slave.

It is not the least among the strange things bred by the intense artificialness of sea-usages, that while in the open air of the deck some officers will, upon provocation, bear themselves boldly and defyingly enough towards their commander; yet, ten to one, let those very officers the next moment go down to their customary dinner in that same commander’s cabin, and straightway their inoffensive, not to say deprecatory and humble air towards him, as he sits at the head of the table; this is marvellous, sometimes most comical. Wherefore this difference? A problem? Perhaps not. To have been Belshazzar, King of Babylon; and to have been Belshazzar, not haughtily but courteously, therein certainly must have been some touch of mundane grandeur. But he who in the rightly regal and intelligent spirit presides over his own private dinner-table of invited guests, that man’s unchallenged power and dominion of individual influence for the time; that man’s royalty of state transcends Belshazzar’s, for Belshazzar was not the greatest. Who has but once dined his friends, has tasted what it is to be Cæsar. It is a witchery of social czarship which there is no withstanding. Now, if to this consideration you superadd the official supremacy of a ship-master, then, by inference, you will derive the cause of that peculiarity of sea-life just mentioned.

Over his ivory-inlaid table, Ahab presided like a mute, maned sea-lion on the white coral beach, surrounded by his warlike but still deferential cubs. In his own proper turn, each officer waited to be served. They were as little children before Ahab; and yet, in Ahab, there seemed not to lurk the smallest social arrogance. With one mind, their intent eyes all fastened upon the old man’s knife, as he carved the chief dish before him. I do not suppose that for the world they would have profaned that moment with the slightest observation, even upon so neutral a topic as the weather. No! And when reaching out his knife and fork, between which the slice of beef was locked, Ahab thereby motioned Starbuck’s plate towards him, the mate received his meat as though receiving alms; and cut it tenderly; and a little started if, perchance, the knife grazed against the plate; and chewed it noiselessly; and swallowed it, not without circumspection. For, like the Coronation banquet at Frankfort, where the German Emperor profoundly dines with the seven Imperial Electors, so these cabin meals were somehow solemn meals, eaten in awful silence; and yet at table old Ahab forbade not conversation; only he himself was dumb. What a relief it was to choking Stubb, when a rat made a sudden racket in the hold below. And poor little Flask, he was the youngest son, and little boy of this weary family party. His were the shinbones of the saline beef; his would have been the drumsticks. For Flask to have presumed to help himself, this must have seemed to him tantamount to larceny in the first degree. Had he helped himself at that table, doubtless, never more would he have been able to hold his head up in this honest world; nevertheless, strange to say, Ahab never forbade him. And had Flask helped himself, the chances were Ahab had never so much as noticed it. Least of all, did Flask presume to help himself to butter. Whether he thought the owners of the ship denied it to him, on account of its clotting his clear, sunny complexion; or whether he deemed that, on so long a voyage in such marketless waters, butter was at a premium, and therefore was not for him, a subaltern; however it was, Flask, alas! was a butterless man!

Another thing. Flask was the last person down at the dinner, and Flask is the first man up. Consider! For hereby Flask’s dinner was badly jammed in point of time. Starbuck and Stubb both had the start of him; and yet they also have the privilege of lounging in the rear. If Stubb even, who is but a peg higher than Flask, happens to have but a small appetite, and soon shows symptoms of concluding his repast, then Flask must bestir himself, he will not get more than three mouthfuls that day; for it is against holy usage for Stubb to precede Flask to the deck. Therefore it was that Flask once admitted in private, that ever since he had arisen to the dignity of an officer, from that moment he had never known what it was to be otherwise than hungry, more or less. For what he ate did not so much relieve his hunger, as keep it immortal in him. Peace and satisfaction, thought Flask, have for ever departed from my stomach. I am an officer; but, how I wish I could fish a bit of old-fashioned beef in the forecastle, as I used to when I was before the mast. There’s the fruits of promotion now; there’s the vanity of glory: there’s the insanity of life! Besides, if it were so that any mere sailor of the Pequod had a grudge against Flask in Flask’s official capacity, all that sailor had to do, in order to obtain ample vengeance, was to go aft at dinner-time, and get a peep at Flask through the cabin sky-light, sitting silly and dumfoundered before awful Ahab.

Now, Ahab and his three mates formed what may be called the first table in the Pequod’s cabin. After their departure, taking place in inverted order to their arrival, the canvas cloth was cleared, or rather was restored to some hurried order by the pallid steward. And then the three harpooneers were bidden to the feast, they being its residuary legatees. They made a sort of temporary servants’ hall of the high and mighty cabin.

In strange contrast to the hardly tolerable constraint and nameless invisible domineerings of the captain’s table, was the entire care-free license and ease, the almost frantic democracy of those inferior fellows the harpooneers. While their masters, the mates, seemed afraid of the sound of the hinges of their own jaws, the harpooneers chewed their food with such a relish that there was a report to it. They dined like lords; they filled their bellies like Indian ships all day loading with spices. Such portentous appetites had Queequeg and Tashtego, that to fill out the vacancies made by the previous repast, often the pale Dough-Boy was fain to bring on a great baron of salt-junk, seemingly quarried out of the solid ox. And if he were not lively about it, if he did not go with a nimble hop-skip-and-jump, then Tashtego had an ungentlemanly way of accelerating him by darting a fork at his back, harpoon-wise. And once Daggoo, seized with a sudden humor, assisted Dough-Boy’s memory by snatching him up bodily, and thrusting his head into a great empty wooden trencher, while Tashtego, knife in hand, began laying out the circle preliminary to scalping him. He was naturally a very nervous, shuddering sort of little fellow, this bread-faced steward; the progeny of a bankrupt baker and a hospital nurse. And what with the standing spectacle of the black terrific Ahab, and the periodical tumultuous visitations of these three savages, Dough-Boy’s whole life was one continual lip-quiver. Commonly, after seeing the harpooneers furnished with all things they demanded, he would escape from their clutches into his little pantry adjoining, and fearfully peep out at them through the blinds of its door, till all was over.

It was a sight to see Queequeg seated over against Tashtego, opposing his filed teeth to the Indian’s: crosswise to them, Daggoo seated on the floor, for a bench would have brought his hearse-plumed head to the low carlines; at every motion of his colossal limbs, making the low cabin framework to shake, as when an African elephant goes passenger in a ship. But for all this, the great negro was wonderfully abstemious, not to say dainty. It seemed hardly possible that by such comparatively small mouthfuls he could keep up the vitality diffused through so broad, baronial, and superb a person. But, doubtless, this noble savage fed strong and drank deep of the abounding element of air; and through his dilated nostrils snuffed in the sublime life of the worlds. Not by beef or by bread, are giants made or nourished. But Queequeg, he had a mortal, barbaric smack of the lip in eating—an ugly sound enough—so much so, that the trembling Dough-Boy almost looked to see whether any marks of teeth lurked in his own lean arms. And when he would hear Tashtego singing out for him to produce himself, that his bones might be picked, the simple-witted steward all but shattered the crockery hanging round him in the pantry, by his sudden fits of the palsy. Nor did the whetstone which the harpooneers carried in their pockets, for their lances and other weapons; and with which whetstones, at dinner, they would ostentatiously sharpen their knives; that grating sound did not at all tend to tranquillize poor Dough-Boy. How could he forget that in his Island days, Queequeg, for one, must certainly have been guilty of some murderous, convivial indiscretions. Alas! Dough-Boy! hard fares the white waiter who waits upon cannibals. Not a napkin should he carry on his arm, but a buckler. In good time, though, to his great delight, the three salt-sea warriors would rise and depart; to his credulous, fable-mongering ears, all their martial bones jingling in them at every step, like Moorish scimetars in scabbards.

But, though these barbarians dined in the cabin, and nominally lived there; still, being anything but sedentary in their habits, they were scarcely ever in it except at mealtimes, and just before sleeping-time, when they passed through it to their own peculiar quarters.

In this one matter, Ahab seemed no exception to most American whale captains, who, as a set, rather incline to the opinion that by rights the ship’s cabin belongs to them; and that it is by courtesy alone that anybody else is, at any time, permitted there. So that, in real truth, the mates and harpooneers of the Pequod might more properly be said to have lived out of the cabin than in it. For when they did enter it, it was something as a street-door enters a house; turning inwards for a moment, only to be turned out the next; and, as a permanent thing, residing in the open air. Nor did they lose much hereby; in the cabin was no companionship; socially, Ahab was inaccessible. Though nominally included in the census of Christendom, he was still an alien to it. He lived in the world, as the last of the Grisly Bears lived in settled Missouri. And as when Spring and Summer had departed, that wild Logan of the woods, burying himself in the hollow of a tree, lived out the winter there, sucking his own paws; so, in his inclement, howling old age, Ahab’s soul, shut up in the caved trunk of his body, there fed upon the sullen paws of its gloom!






CHAPTER 35. The Mast-Head.
It was during the more pleasant weather, that in due rotation with the other seamen my first mast-head came round.

In most American whalemen the mast-heads are manned almost simultaneously with the vessel’s leaving her port; even though she may have fifteen thousand miles, and more, to sail ere reaching her proper cruising ground. And if, after a three, four, or five years’ voyage she is drawing nigh home with anything empty in her—say, an empty vial even—then, her mast-heads are kept manned to the last; and not till her skysail-poles sail in among the spires of the port, does she altogether relinquish the hope of capturing one whale more.

Now, as the business of standing mast-heads, ashore or afloat, is a very ancient and interesting one, let us in some measure expatiate here. I take it, that the earliest standers of mast-heads were the old Egyptians; because, in all my researches, I find none prior to them. For though their progenitors, the builders of Babel, must doubtless, by their tower, have intended to rear the loftiest mast-head in all Asia, or Africa either; yet (ere the final truck was put to it) as that great stone mast of theirs may be said to have gone by the board, in the dread gale of God’s wrath; therefore, we cannot give these Babel builders priority over the Egyptians. And that the Egyptians were a nation of mast-head standers, is an assertion based upon the general belief among archæologists, that the first pyramids were founded for astronomical purposes: a theory singularly supported by the peculiar stair-like formation of all four sides of those edifices; whereby, with prodigious long upliftings of their legs, those old astronomers were wont to mount to the apex, and sing out for new stars; even as the look-outs of a modern ship sing out for a sail, or a whale just bearing in sight. In Saint Stylites, the famous Christian hermit of old times, who built him a lofty stone pillar in the desert and spent the whole latter portion of his life on its summit, hoisting his food from the ground with a tackle; in him we have a remarkable instance of a dauntless stander-of-mast-heads; who was not to be driven from his place by fogs or frosts, rain, hail, or sleet; but valiantly facing everything out to the last, literally died at his post. Of modern standers-of-mast-heads we have but a lifeless set; mere stone, iron, and bronze men; who, though well capable of facing out a stiff gale, are still entirely incompetent to the business of singing out upon discovering any strange sight. There is Napoleon; who, upon the top of the column of Vendome, stands with arms folded, some one hundred and fifty feet in the air; careless, now, who rules the decks below; whether Louis Philippe, Louis Blanc, or Louis the Devil. Great Washington, too, stands high aloft on his towering main-mast in Baltimore, and like one of Hercules’ pillars, his column marks that point of human grandeur beyond which few mortals will go. Admiral Nelson, also, on a capstan of gun-metal, stands his mast-head in Trafalgar Square; and ever when most obscured by that London smoke, token is yet given that a hidden hero is there; for where there is smoke, must be fire. But neither great Washington, nor Napoleon, nor Nelson, will answer a single hail from below, however madly invoked to befriend by their counsels the distracted decks upon which they gaze; however it may be surmised, that their spirits penetrate through the thick haze of the future, and descry what shoals and what rocks must be shunned.

It may seem unwarrantable to couple in any respect the mast-head standers of the land with those of the sea; but that in truth it is not so, is plainly evinced by an item for which Obed Macy, the sole historian of Nantucket, stands accountable. The worthy Obed tells us, that in the early times of the whale fishery, ere ships were regularly launched in pursuit of the game, the people of that island erected lofty spars along the sea-coast, to which the look-outs ascended by means of nailed cleats, something as fowls go upstairs in a hen-house. A few years ago this same plan was adopted by the Bay whalemen of New Zealand, who, upon descrying the game, gave notice to the ready-manned boats nigh the beach. But this custom has now become obsolete; turn we then to the one proper mast-head, that of a whale-ship at sea. The three mast-heads are kept manned from sun-rise to sun-set; the seamen taking their regular turns (as at the helm), and relieving each other every two hours. In the serene weather of the tropics it is exceedingly pleasant the mast-head; nay, to a dreamy meditative man it is delightful. There you stand, a hundred feet above the silent decks, striding along the deep, as if the masts were gigantic stilts, while beneath you and between your legs, as it were, swim the hugest monsters of the sea, even as ships once sailed between the boots of the famous Colossus at old Rhodes. There you stand, lost in the infinite series of the sea, with nothing ruffled but the waves. The tranced ship indolently rolls; the drowsy trade winds blow; everything resolves you into languor. For the most part, in this tropic whaling life, a sublime uneventfulness invests you; you hear no news; read no gazettes; extras with startling accounts of commonplaces never delude you into unnecessary excitements; you hear of no domestic afflictions; bankrupt securities; fall of stocks; are never troubled with the thought of what you shall have for dinner—for all your meals for three years and more are snugly stowed in casks, and your bill of fare is immutable.

In one of those southern whalesmen, on a long three or four years’ voyage, as often happens, the sum of the various hours you spend at the mast-head would amount to several entire months. And it is much to be deplored that the place to which you devote so considerable a portion of the whole term of your natural life, should be so sadly destitute of anything approaching to a cosy inhabitiveness, or adapted to breed a comfortable localness of feeling, such as pertains to a bed, a hammock, a hearse, a sentry box, a pulpit, a coach, or any other of those small and snug contrivances in which men temporarily isolate themselves. Your most usual point of perch is the head of the t’ gallant-mast, where you stand upon two thin parallel sticks (almost peculiar to whalemen) called the t’ gallant cross-trees. Here, tossed about by the sea, the beginner feels about as cosy as he would standing on a bull’s horns. To be sure, in cold weather you may carry your house aloft with you, in the shape of a watch-coat; but properly speaking the thickest watch-coat is no more of a house than the unclad body; for as the soul is glued inside of its fleshy tabernacle, and cannot freely move about in it, nor even move out of it, without running great risk of perishing (like an ignorant pilgrim crossing the snowy Alps in winter); so a watch-coat is not so much of a house as it is a mere envelope, or additional skin encasing you. You cannot put a shelf or chest of drawers in your body, and no more can you make a convenient closet of your watch-coat.

Concerning all this, it is much to be deplored that the mast-heads of a southern whale ship are unprovided with those enviable little tents or pulpits, called crow’s-nests, in which the look-outs of a Greenland whaler are protected from the inclement weather of the frozen seas. In the fireside narrative of Captain Sleet, entitled “A Voyage among the Icebergs, in quest of the Greenland Whale, and incidentally for the re-discovery of the Lost Icelandic Colonies of Old Greenland;” in this admirable volume, all standers of mast-heads are furnished with a charmingly circumstantial account of the then recently invented crow’s-nest of the Glacier, which was the name of Captain Sleet’s good craft. He called it the Sleet’s crow’s-nest, in honor of himself; he being the original inventor and patentee, and free from all ridiculous false delicacy, and holding that if we call our own children after our own names (we fathers being the original inventors and patentees), so likewise should we denominate after ourselves any other apparatus we may beget. In shape, the Sleet’s crow’s-nest is something like a large tierce or pipe; it is open above, however, where it is furnished with a movable side-screen to keep to windward of your head in a hard gale. Being fixed on the summit of the mast, you ascend into it through a little trap-hatch in the bottom. On the after side, or side next the stern of the ship, is a comfortable seat, with a locker underneath for umbrellas, comforters, and coats. In front is a leather rack, in which to keep your speaking trumpet, pipe, telescope, and other nautical conveniences. When Captain Sleet in person stood his mast-head in this crow’s-nest of his, he tells us that he always had a rifle with him (also fixed in the rack), together with a powder flask and shot, for the purpose of popping off the stray narwhales, or vagrant sea unicorns infesting those waters; for you cannot successfully shoot at them from the deck owing to the resistance of the water, but to shoot down upon them is a very different thing. Now, it was plainly a labor of love for Captain Sleet to describe, as he does, all the little detailed conveniences of his crow’s-nest; but though he so enlarges upon many of these, and though he treats us to a very scientific account of his experiments in this crow’s-nest, with a small compass he kept there for the purpose of counteracting the errors resulting from what is called the “local attraction” of all binnacle magnets; an error ascribable to the horizontal vicinity of the iron in the ship’s planks, and in the Glacier’s case, perhaps, to there having been so many broken-down blacksmiths among her crew; I say, that though the Captain is very discreet and scientific here, yet, for all his learned “binnacle deviations,” “azimuth compass observations,” and “approximate errors,” he knows very well, Captain Sleet, that he was not so much immersed in those profound magnetic meditations, as to fail being attracted occasionally towards that well replenished little case-bottle, so nicely tucked in on one side of his crow’s nest, within easy reach of his hand. Though, upon the whole, I greatly admire and even love the brave, the honest, and learned Captain; yet I take it very ill of him that he should so utterly ignore that case-bottle, seeing what a faithful friend and comforter it must have been, while with mittened fingers and hooded head he was studying the mathematics aloft there in that bird’s nest within three or four perches of the pole.

But if we Southern whale-fishers are not so snugly housed aloft as Captain Sleet and his Greenlandmen were; yet that disadvantage is greatly counter-balanced by the widely contrasting serenity of those seductive seas in which we South fishers mostly float. For one, I used to lounge up the rigging very leisurely, resting in the top to have a chat with Queequeg, or any one else off duty whom I might find there; then ascending a little way further, and throwing a lazy leg over the top-sail yard, take a preliminary view of the watery pastures, and so at last mount to my ultimate destination.

Let me make a clean breast of it here, and frankly admit that I kept but sorry guard. With the problem of the universe revolving in me, how could I—being left completely to myself at such a thought-engendering altitude—how could I but lightly hold my obligations to observe all whale-ships’ standing orders, “Keep your weather eye open, and sing out every time.”

And let me in this place movingly admonish you, ye ship-owners of Nantucket! Beware of enlisting in your vigilant fisheries any lad with lean brow and hollow eye; given to unseasonable meditativeness; and who offers to ship with the Phædon instead of Bowditch in his head. Beware of such an one, I say; your whales must be seen before they can be killed; and this sunken-eyed young Platonist will tow you ten wakes round the world, and never make you one pint of sperm the richer. Nor are these monitions at all unneeded. For nowadays, the whale-fishery furnishes an asylum for many romantic, melancholy, and absent-minded young men, disgusted with the carking cares of earth, and seeking sentiment in tar and blubber. Childe Harold not unfrequently perches himself upon the mast-head of some luckless disappointed whale-ship, and in moody phrase ejaculates:—

      “Roll on, thou deep and dark blue ocean, roll!
      Ten thousand blubber-hunters sweep over thee in vain.”
Very often do the captains of such ships take those absent-minded young philosophers to task, upbraiding them with not feeling sufficient “interest” in the voyage; half-hinting that they are so hopelessly lost to all honorable ambition, as that in their secret souls they would rather not see whales than otherwise. But all in vain; those young Platonists have a notion that their vision is imperfect; they are short-sighted; what use, then, to strain the visual nerve? They have left their opera-glasses at home.

“Why, thou monkey,” said a harpooneer to one of these lads, “we’ve been cruising now hard upon three years, and thou hast not raised a whale yet. Whales are scarce as hen’s teeth whenever thou art up here.” Perhaps they were; or perhaps there might have been shoals of them in the far horizon; but lulled into such an opium-like listlessness of vacant, unconscious reverie is this absent-minded youth by the blending cadence of waves with thoughts, that at last he loses his identity; takes the mystic ocean at his feet for the visible image of that deep, blue, bottomless soul, pervading mankind and nature; and every strange, half-seen, gliding, beautiful thing that eludes him; every dimly-discovered, uprising fin of some undiscernible form, seems to him the embodiment of those elusive thoughts that only people the soul by continually flitting through it. In this enchanted mood, thy spirit ebbs away to whence it came; becomes diffused through time and space; like Cranmer’s sprinkled Pantheistic ashes, forming at last a part of every shore the round globe over.

There is no life in thee, now, except that rocking life imparted by a gently rolling ship; by her, borrowed from the sea; by the sea, from the inscrutable tides of God. But while this sleep, this dream is on ye, move your foot or hand an inch; slip your hold at all; and your identity comes back in horror. Over Descartian vortices you hover. And perhaps, at mid-day, in the fairest weather, with one half-throttled shriek you drop through that transparent air into the summer sea, no more to rise for ever. Heed it well, ye Pantheists!






CHAPTER 36. The Quarter-Deck.
(Enter Ahab: Then, all.)

It was not a great while after the affair of the pipe, that one morning shortly after breakfast, Ahab, as was his wont, ascended the cabin-gangway to the deck. There most sea-captains usually walk at that hour, as country gentlemen, after the same meal, take a few turns in the garden.

Soon his steady, ivory stride was heard, as to and fro he paced his old rounds, upon planks so familiar to his tread, that they were all over dented, like geological stones, with the peculiar mark of his walk. Did you fixedly gaze, too, upon that ribbed and dented brow; there also, you would see still stranger foot-prints—the foot-prints of his one unsleeping, ever-pacing thought.

But on the occasion in question, those dents looked deeper, even as his nervous step that morning left a deeper mark. And, so full of his thought was Ahab, that at every uniform turn that he made, now at the main-mast and now at the binnacle, you could almost see that thought turn in him as he turned, and pace in him as he paced; so completely possessing him, indeed, that it all but seemed the inward mould of every outer movement.

“D’ye mark him, Flask?” whispered Stubb; “the chick that’s in him pecks the shell. ’Twill soon be out.”

The hours wore on;—Ahab now shut up within his cabin; anon, pacing the deck, with the same intense bigotry of purpose in his aspect.

It drew near the close of day. Suddenly he came to a halt by the bulwarks, and inserting his bone leg into the auger-hole there, and with one hand grasping a shroud, he ordered Starbuck to send everybody aft.

“Sir!” said the mate, astonished at an order seldom or never given on ship-board except in some extraordinary case.

“Send everybody aft,” repeated Ahab. “Mast-heads, there! come down!”

When the entire ship’s company were assembled, and with curious and not wholly unapprehensive faces, were eyeing him, for he looked not unlike the weather horizon when a storm is coming up, Ahab, after rapidly glancing over the bulwarks, and then darting his eyes among the crew, started from his standpoint; and as though not a soul were nigh him resumed his heavy turns upon the deck. With bent head and half-slouched hat he continued to pace, unmindful of the wondering whispering among the men; till Stubb cautiously whispered to Flask, that Ahab must have summoned them there for the purpose of witnessing a pedestrian feat. But this did not last long. Vehemently pausing, he cried:—

“What do ye do when ye see a whale, men?”

“Sing out for him!” was the impulsive rejoinder from a score of clubbed voices.

“Good!” cried Ahab, with a wild approval in his tones; observing the hearty animation into which his unexpected question had so magnetically thrown them.

“And what do ye next, men?”

“Lower away, and after him!”

“And what tune is it ye pull to, men?”

“A dead whale or a stove boat!”

More and more strangely and fiercely glad and approving, grew the countenance of the old man at every shout; while the mariners began to gaze curiously at each other, as if marvelling how it was that they themselves became so excited at such seemingly purposeless questions.

But, they were all eagerness again, as Ahab, now half-revolving in his pivot-hole, with one hand reaching high up a shroud, and tightly, almost convulsively grasping it, addressed them thus:—

“All ye mast-headers have before now heard me give orders about a white whale. Look ye! d’ye see this Spanish ounce of gold?”—holding up a broad bright coin to the sun—“it is a sixteen dollar piece, men. D’ye see it? Mr. Starbuck, hand me yon top-maul.”

While the mate was getting the hammer, Ahab, without speaking, was slowly rubbing the gold piece against the skirts of his jacket, as if to heighten its lustre, and without using any words was meanwhile lowly humming to himself, producing a sound so strangely muffled and inarticulate that it seemed the mechanical humming of the wheels of his vitality in him.

Receiving the top-maul from Starbuck, he advanced towards the main-mast with the hammer uplifted in one hand, exhibiting the gold with the other, and with a high raised voice exclaiming: “Whosoever of ye raises me a white-headed whale with a wrinkled brow and a crooked jaw; whosoever of ye raises me that white-headed whale, with three holes punctured in his starboard fluke—look ye, whosoever of ye raises me that same white whale, he shall have this gold ounce, my boys!”

“Huzza! huzza!” cried the seamen, as with swinging tarpaulins they hailed the act of nailing the gold to the mast.

“It’s a white whale, I say,” resumed Ahab, as he threw down the topmaul: “a white whale. Skin your eyes for him, men; look sharp for white water; if ye see but a bubble, sing out.”

All this while Tashtego, Daggoo, and Queequeg had looked on with even more intense interest and surprise than the rest, and at the mention of the wrinkled brow and crooked jaw they had started as if each was separately touched by some specific recollection.

“Captain Ahab,” said Tashtego, “that white whale must be the same that some call Moby Dick.”

“Moby Dick?” shouted Ahab. “Do ye know the white whale then, Tash?”

“Does he fan-tail a little curious, sir, before he goes down?” said the Gay-Header deliberately.

“And has he a curious spout, too,” said Daggoo, “very bushy, even for a parmacetty, and mighty quick, Captain Ahab?”

“And he have one, two, three—oh! good many iron in him hide, too, Captain,” cried Queequeg disjointedly, “all twiske-tee be-twisk, like him—him—” faltering hard for a word, and screwing his hand round and round as though uncorking a bottle—“like him—him—”

“Corkscrew!” cried Ahab, “aye, Queequeg, the harpoons lie all twisted and wrenched in him; aye, Daggoo, his spout is a big one, like a whole shock of wheat, and white as a pile of our Nantucket wool after the great annual sheep-shearing; aye, Tashtego, and he fan-tails like a split jib in a squall. Death and devils! men, it is Moby Dick ye have seen—Moby Dick—Moby Dick!”

“Captain Ahab,” said Starbuck, who, with Stubb and Flask, had thus far been eyeing his superior with increasing surprise, but at last seemed struck with a thought which somewhat explained all the wonder. “Captain Ahab, I have heard of Moby Dick—but it was not Moby Dick that took off thy leg?”

“Who told thee that?” cried Ahab; then pausing, “Aye, Starbuck; aye, my hearties all round; it was Moby Dick that dismasted me; Moby Dick that brought me to this dead stump I stand on now. Aye, aye,” he shouted with a terrific, loud, animal sob, like that of a heart-stricken moose; “Aye, aye! it was that accursed white whale that razeed me; made a poor pegging lubber of me for ever and a day!” Then tossing both arms, with measureless imprecations he shouted out: “Aye, aye! and I’ll chase him round Good Hope, and round the Horn, and round the Norway Maelstrom, and round perdition’s flames before I give him up. And this is what ye have shipped for, men! to chase that white whale on both sides of land, and over all sides of earth, till he spouts black blood and rolls fin out. What say ye, men, will ye splice hands on it, now? I think ye do look brave.”

“Aye, aye!” shouted the harpooneers and seamen, running closer to the excited old man: “A sharp eye for the white whale; a sharp lance for Moby Dick!”

“God bless ye,” he seemed to half sob and half shout. “God bless ye, men. Steward! go draw the great measure of grog. But what’s this long face about, Mr. Starbuck; wilt thou not chase the white whale? art not game for Moby Dick?”

“I am game for his crooked jaw, and for the jaws of Death too, Captain Ahab, if it fairly comes in the way of the business we follow; but I came here to hunt whales, not my commander’s vengeance. How many barrels will thy vengeance yield thee even if thou gettest it, Captain Ahab? it will not fetch thee much in our Nantucket market.”

“Nantucket market! Hoot! But come closer, Starbuck; thou requirest a little lower layer. If money’s to be the measurer, man, and the accountants have computed their great counting-house the globe, by girdling it with guineas, one to every three parts of an inch; then, let me tell thee, that my vengeance will fetch a great premium here!”

“He smites his chest,” whispered Stubb, “what’s that for? methinks it rings most vast, but hollow.”

“Vengeance on a dumb brute!” cried Starbuck, “that simply smote thee from blindest instinct! Madness! To be enraged with a dumb thing, Captain Ahab, seems blasphemous.”

“Hark ye yet again—the little lower layer. All visible objects, man, are but as pasteboard masks. But in each event—in the living act, the undoubted deed—there, some unknown but still reasoning thing puts forth the mouldings of its features from behind the unreasoning mask. If man will strike, strike through the mask! How can the prisoner reach outside except by thrusting through the wall? To me, the white whale is that wall, shoved near to me. Sometimes I think there’s naught beyond. But ’tis enough. He tasks me; he heaps me; I see in him outrageous strength, with an inscrutable malice sinewing it. That inscrutable thing is chiefly what I hate; and be the white whale agent, or be the white whale principal, I will wreak that hate upon him. Talk not to me of blasphemy, man; I’d strike the sun if it insulted me. For could the sun do that, then could I do the other; since there is ever a sort of fair play herein, jealousy presiding over all creations. But not my master, man, is even that fair play. Who’s over me? Truth hath no confines. Take off thine eye! more intolerable than fiends’ glarings is a doltish stare! So, so; thou reddenest and palest; my heat has melted thee to anger-glow. But look ye, Starbuck, what is said in heat, that thing unsays itself. There are men from whom warm words are small indignity. I meant not to incense thee. Let it go. Look! see yonder Turkish cheeks of spotted tawn—living, breathing pictures painted by the sun. The Pagan leopards—the unrecking and unworshipping things, that live; and seek, and give no reasons for the torrid life they feel! The crew, man, the crew! Are they not one and all with Ahab, in this matter of the whale? See Stubb! he laughs! See yonder Chilian! he snorts to think of it. Stand up amid the general hurricane, thy one tost sapling cannot, Starbuck! And what is it? Reckon it. ’Tis but to help strike a fin; no wondrous feat for Starbuck. What is it more? From this one poor hunt, then, the best lance out of all Nantucket, surely he will not hang back, when every foremast-hand has clutched a whetstone? Ah! constrainings seize thee; I see! the billow lifts thee! Speak, but speak!—Aye, aye! thy silence, then, that voices thee. (Aside) Something shot from my dilated nostrils, he has inhaled it in his lungs. Starbuck now is mine; cannot oppose me now, without rebellion.”

“God keep me!—keep us all!” murmured Starbuck, lowly.

But in his joy at the enchanted, tacit acquiescence of the mate, Ahab did not hear his foreboding invocation; nor yet the low laugh from the hold; nor yet the presaging vibrations of the winds in the cordage; nor yet the hollow flap of the sails against the masts, as for a moment their hearts sank in. For again Starbuck’s downcast eyes lighted up with the stubbornness of life; the subterranean laugh died away; the winds blew on; the sails filled out; the ship heaved and rolled as before. Ah, ye admonitions and warnings! why stay ye not when ye come? But rather are ye predictions than warnings, ye shadows! Yet not so much predictions from without, as verifications of the foregoing things within. For with little external to constrain us, the innermost necessities in our being, these still drive us on.

“The measure! the measure!” cried Ahab.

Receiving the brimming pewter, and turning to the harpooneers, he ordered them to produce their weapons. Then ranging them before him near the capstan, with their harpoons in their hands, while his three mates stood at his side with their lances, and the rest of the ship’s company formed a circle round the group; he stood for an instant searchingly eyeing every man of his crew. But those wild eyes met his, as the bloodshot eyes of the prairie wolves meet the eye of their leader, ere he rushes on at their head in the trail of the bison; but, alas! only to fall into the hidden snare of the Indian.

“Drink and pass!” he cried, handing the heavy charged flagon to the nearest seaman. “The crew alone now drink. Round with it, round! Short draughts—long swallows, men; ’tis hot as Satan’s hoof. So, so; it goes round excellently. It spiralizes in ye; forks out at the serpent-snapping eye. Well done; almost drained. That way it went, this way it comes. Hand it me—here’s a hollow! Men, ye seem the years; so brimming life is gulped and gone. Steward, refill!

“Attend now, my braves. I have mustered ye all round this capstan; and ye mates, flank me with your lances; and ye harpooneers, stand there with your irons; and ye, stout mariners, ring me in, that I may in some sort revive a noble custom of my fisherman fathers before me. O men, you will yet see that—Ha! boy, come back? bad pennies come not sooner. Hand it me. Why, now, this pewter had run brimming again, wer’t not thou St. Vitus’ imp—away, thou ague!

“Advance, ye mates! Cross your lances full before me. Well done! Let me touch the axis.” So saying, with extended arm, he grasped the three level, radiating lances at their crossed centre; while so doing, suddenly and nervously twitched them; meanwhile, glancing intently from Starbuck to Stubb; from Stubb to Flask. It seemed as though, by some nameless, interior volition, he would fain have shocked into them the same fiery emotion accumulated within the Leyden jar of his own magnetic life. The three mates quailed before his strong, sustained, and mystic aspect. Stubb and Flask looked sideways from him; the honest eye of Starbuck fell downright.

“In vain!” cried Ahab; “but, maybe, ’tis well. For did ye three but once take the full-forced shock, then mine own electric thing, that had perhaps expired from out me. Perchance, too, it would have dropped ye dead. Perchance ye need it not. Down lances! And now, ye mates, I do appoint ye three cupbearers to my three pagan kinsmen there—yon three most honorable gentlemen and noblemen, my valiant harpooneers. Disdain the task? What, when the great Pope washes the feet of beggars, using his tiara for ewer? Oh, my sweet cardinals! your own condescension, that shall bend ye to it. I do not order ye; ye will it. Cut your seizings and draw the poles, ye harpooneers!”

Silently obeying the order, the three harpooneers now stood with the detached iron part of their harpoons, some three feet long, held, barbs up, before him.

“Stab me not with that keen steel! Cant them; cant them over! know ye not the goblet end? Turn up the socket! So, so; now, ye cup-bearers, advance. The irons! take them; hold them while I fill!” Forthwith, slowly going from one officer to the other, he brimmed the harpoon sockets with the fiery waters from the pewter.

“Now, three to three, ye stand. Commend the murderous chalices! Bestow them, ye who are now made parties to this indissoluble league. Ha! Starbuck! but the deed is done! Yon ratifying sun now waits to sit upon it. Drink, ye harpooneers! drink and swear, ye men that man the deathful whaleboat’s bow—Death to Moby Dick! God hunt us all, if we do not hunt Moby Dick to his death!” The long, barbed steel goblets were lifted; and to cries and maledictions against the white whale, the spirits were simultaneously quaffed down with a hiss. Starbuck paled, and turned, and shivered. Once more, and finally, the replenished pewter went the rounds among the frantic crew; when, waving his free hand to them, they all dispersed; and Ahab retired within his cabin.






CHAPTER 37. Sunset.
The cabin; by the stern windows; Ahab sitting alone, and gazing out.

I leave a white and turbid wake; pale waters, paler cheeks, where’er I sail. The envious billows sidelong swell to whelm my track; let them; but first I pass.

Yonder, by ever-brimming goblet’s rim, the warm waves blush like wine. The gold brow plumbs the blue. The diver sun—slow dived from noon—goes down; my soul mounts up! she wearies with her endless hill. Is, then, the crown too heavy that I wear? this Iron Crown of Lombardy. Yet is it bright with many a gem; I the wearer, see not its far flashings; but darkly feel that I wear that, that dazzlingly confounds. ’Tis iron—that I know—not gold. ’Tis split, too—that I feel; the jagged edge galls me so, my brain seems to beat against the solid metal; aye, steel skull, mine; the sort that needs no helmet in the most brain-battering fight!

Dry heat upon my brow? Oh! time was, when as the sunrise nobly spurred me, so the sunset soothed. No more. This lovely light, it lights not me; all loveliness is anguish to me, since I can ne’er enjoy. Gifted with the high perception, I lack the low, enjoying power; damned, most subtly and most malignantly! damned in the midst of Paradise! Good night—good night! (waving his hand, he moves from the window.)

’Twas not so hard a task. I thought to find one stubborn, at the least; but my one cogged circle fits into all their various wheels, and they revolve. Or, if you will, like so many ant-hills of powder, they all stand before me; and I their match. Oh, hard! that to fire others, the match itself must needs be wasting! What I’ve dared, I’ve willed; and what I’ve willed, I’ll do! They think me mad—Starbuck does; but I’m demoniac, I am madness maddened! That wild madness that’s only calm to comprehend itself! The prophecy was that I should be dismembered; and—Aye! I lost this leg. I now prophesy that I will dismember my dismemberer. Now, then, be the prophet and the fulfiller one. That’s more than ye, ye great gods, ever were. I laugh and hoot at ye, ye cricket-players, ye pugilists, ye deaf Burkes and blinded Bendigoes! I will not say as schoolboys do to bullies—Take some one of your own size; don’t pommel me! No, ye’ve knocked me down, and I am up again; but ye have run and hidden. Come forth from behind your cotton bags! I have no long gun to reach ye. Come, Ahab’s compliments to ye; come and see if ye can swerve me. Swerve me? ye cannot swerve me, else ye swerve yourselves! man has ye there. Swerve me? The path to my fixed purpose is laid with iron rails, whereon my soul is grooved to run. Over unsounded gorges, through the rifled hearts of mountains, under torrents’ beds, unerringly I rush! Naught’s an obstacle, naught’s an angle to the iron way!






CHAPTER 38. Dusk.
By the Mainmast; Starbuck leaning against it.

My soul is more than matched; she’s overmanned; and by a madman! Insufferable sting, that sanity should ground arms on such a field! But he drilled deep down, and blasted all my reason out of me! I think I see his impious end; but feel that I must help him to it. Will I, nill I, the ineffable thing has tied me to him; tows me with a cable I have no knife to cut. Horrible old man! Who’s over him, he cries;—aye, he would be a democrat to all above; look, how he lords it over all below! Oh! I plainly see my miserable office,—to obey, rebelling; and worse yet, to hate with touch of pity! For in his eyes I read some lurid woe would shrivel me up, had I it. Yet is there hope. Time and tide flow wide. The hated whale has the round watery world to swim in, as the small gold-fish has its glassy globe. His heaven-insulting purpose, God may wedge aside. I would up heart, were it not like lead. But my whole clock’s run down; my heart the all-controlling weight, I have no key to lift again.

[A burst of revelry from the forecastle.]

Oh, God! to sail with such a heathen crew that have small touch of human mothers in them! Whelped somewhere by the sharkish sea. The white whale is their demigorgon. Hark! the infernal orgies! that revelry is forward! mark the unfaltering silence aft! Methinks it pictures life. Foremost through the sparkling sea shoots on the gay, embattled, bantering bow, but only to drag dark Ahab after it, where he broods within his sternward cabin, builded over the dead water of the wake, and further on, hunted by its wolfish gurglings. The long howl thrills me through! Peace! ye revellers, and set the watch! Oh, life! ’tis in an hour like this, with soul beat down and held to knowledge,—as wild, untutored things are forced to feed—Oh, life! ’tis now that I do feel the latent horror in thee! but ’tis not me! that horror’s out of me! and with the soft feeling of the human in me, yet will I try to fight ye, ye grim, phantom futures! Stand by me, hold me, bind me, O ye blessed influences!






CHAPTER 39. First Night-Watch.
Fore-Top.

(Stubb solus, and mending a brace.)

Ha! ha! ha! ha! hem! clear my throat!—I’ve been thinking over it ever since, and that ha, ha’s the final consequence. Why so? Because a laugh’s the wisest, easiest answer to all that’s queer; and come what will, one comfort’s always left—that unfailing comfort is, it’s all predestinated. I heard not all his talk with Starbuck; but to my poor eye Starbuck then looked something as I the other evening felt. Be sure the old Mogul has fixed him, too. I twigged it, knew it; had had the gift, might readily have prophesied it—for when I clapped my eye upon his skull I saw it. Well, Stubb, wise Stubb—that’s my title—well, Stubb, what of it, Stubb? Here’s a carcase. I know not all that may be coming, but be it what it will, I’ll go to it laughing. Such a waggish leering as lurks in all your horribles! I feel funny. Fa, la! lirra, skirra! What’s my juicy little pear at home doing now? Crying its eyes out?—Giving a party to the last arrived harpooneers, I dare say, gay as a frigate’s pennant, and so am I—fa, la! lirra, skirra! Oh—

      We’ll drink to-night with hearts as light,
         To love, as gay and fleeting
      As bubbles that swim, on the beaker’s brim,
         And break on the lips while meeting.
A brave stave that—who calls? Mr. Starbuck? Aye, aye, sir—(Aside) he’s my superior, he has his too, if I’m not mistaken.—Aye, aye, sir, just through with this job—coming.






CHAPTER 40. Midnight, Forecastle.
HARPOONEERS AND SAILORS.

(Foresail rises and discovers the watch standing, lounging, leaning, and lying in various attitudes, all singing in chorus.)

     Farewell and adieu to you, Spanish ladies!
     Farewell and adieu to you, ladies of Spain!
     Our captain’s commanded.—
1ST NANTUCKET SAILOR. Oh, boys, don’t be sentimental; it’s bad for the digestion! Take a tonic, follow me!

(Sings, and all follow.)

    Our captain stood upon the deck,
    A spy-glass in his hand,
    A viewing of those gallant whales
    That blew at every strand.
    Oh, your tubs in your boats, my boys,
    And by your braces stand,
    And we’ll have one of those fine whales,
    Hand, boys, over hand!
    So, be cheery, my lads! may your hearts never fail!
    While the bold harpooner is striking the whale!
MATE’S VOICE FROM THE QUARTER-DECK. Eight bells there, forward!

2ND NANTUCKET SAILOR. Avast the chorus! Eight bells there! d’ye hear, bell-boy? Strike the bell eight, thou Pip! thou blackling! and let me call the watch. I’ve the sort of mouth for that—the hogshead mouth. So, so, (thrusts his head down the scuttle,) Star-bo-l-e-e-n-s, a-h-o-y! Eight bells there below! Tumble up!

DUTCH SAILOR. Grand snoozing to-night, maty; fat night for that. I mark this in our old Mogul’s wine; it’s quite as deadening to some as filliping to others. We sing; they sleep—aye, lie down there, like ground-tier butts. At ’em again! There, take this copper-pump, and hail ’em through it. Tell ’em to avast dreaming of their lasses. Tell ’em it’s the resurrection; they must kiss their last, and come to judgment. That’s the way—that’s it; thy throat ain’t spoiled with eating Amsterdam butter.

FRENCH SAILOR. Hist, boys! let’s have a jig or two before we ride to anchor in Blanket Bay. What say ye? There comes the other watch. Stand by all legs! Pip! little Pip! hurrah with your tambourine!

PIP. (Sulky and sleepy.) Don’t know where it is.

FRENCH SAILOR. Beat thy belly, then, and wag thy ears. Jig it, men, I say; merry’s the word; hurrah! Damn me, won’t you dance? Form, now, Indian-file, and gallop into the double-shuffle? Throw yourselves! Legs! legs!

ICELAND SAILOR. I don’t like your floor, maty; it’s too springy to my taste. I’m used to ice-floors. I’m sorry to throw cold water on the subject; but excuse me.

MALTESE SAILOR. Me too; where’s your girls? Who but a fool would take his left hand by his right, and say to himself, how d’ye do? Partners! I must have partners!

SICILIAN SAILOR. Aye; girls and a green!—then I’ll hop with ye; yea, turn grasshopper!

LONG-ISLAND SAILOR. Well, well, ye sulkies, there’s plenty more of us. Hoe corn when you may, say I. All legs go to harvest soon. Ah! here comes the music; now for it!

AZORE SAILOR. (Ascending, and pitching the tambourine up the scuttle.) Here you are, Pip; and there’s the windlass-bitts; up you mount! Now, boys! (The half of them dance to the tambourine; some go below; some sleep or lie among the coils of rigging. Oaths a-plenty.)

AZORE SAILOR. (Dancing) Go it, Pip! Bang it, bell-boy! Rig it, dig it, stig it, quig it, bell-boy! Make fire-flies; break the jinglers!

PIP. Jinglers, you say?—there goes another, dropped off; I pound it so.

CHINA SAILOR. Rattle thy teeth, then, and pound away; make a pagoda of thyself.

FRENCH SAILOR. Merry-mad! Hold up thy hoop, Pip, till I jump through it! Split jibs! tear yourselves!

TASHTEGO. (Quietly smoking.) That’s a white man; he calls that fun: humph! I save my sweat.

OLD MANX SAILOR. I wonder whether those jolly lads bethink them of what they are dancing over. I’ll dance over your grave, I will—that’s the bitterest threat of your night-women, that beat head-winds round corners. O Christ! to think of the green navies and the green-skulled crews! Well, well; belike the whole world’s a ball, as you scholars have it; and so ’tis right to make one ballroom of it. Dance on, lads, you’re young; I was once.

3D NANTUCKET SAILOR. Spell oh!—whew! this is worse than pulling after whales in a calm—give us a whiff, Tash.

(They cease dancing, and gather in clusters. Meantime the sky darkens—the wind rises.)

LASCAR SAILOR. By Brahma! boys, it’ll be douse sail soon. The sky-born, high-tide Ganges turned to wind! Thou showest thy black brow, Seeva!

MALTESE SAILOR. (Reclining and shaking his cap.) It’s the waves—the snow’s caps turn to jig it now. They’ll shake their tassels soon. Now would all the waves were women, then I’d go drown, and chassee with them evermore! There’s naught so sweet on earth—heaven may not match it!—as those swift glances of warm, wild bosoms in the dance, when the over-arboring arms hide such ripe, bursting grapes.

SICILIAN SAILOR. (Reclining.) Tell me not of it! Hark ye, lad—fleet interlacings of the limbs—lithe swayings—coyings—flutterings! lip! heart! hip! all graze: unceasing touch and go! not taste, observe ye, else come satiety. Eh, Pagan? (Nudging.)

TAHITAN SAILOR. (Reclining on a mat.) Hail, holy nakedness of our dancing girls!—the Heeva-Heeva! Ah! low veiled, high palmed Tahiti! I still rest me on thy mat, but the soft soil has slid! I saw thee woven in the wood, my mat! green the first day I brought ye thence; now worn and wilted quite. Ah me!—not thou nor I can bear the change! How then, if so be transplanted to yon sky? Hear I the roaring streams from Pirohitee’s peak of spears, when they leap down the crags and drown the villages?—The blast! the blast! Up, spine, and meet it! (Leaps to his feet.)

PORTUGUESE SAILOR. How the sea rolls swashing ’gainst the side! Stand by for reefing, hearties! the winds are just crossing swords, pell-mell they’ll go lunging presently.

DANISH SAILOR. Crack, crack, old ship! so long as thou crackest, thou holdest! Well done! The mate there holds ye to it stiffly. He’s no more afraid than the isle fort at Cattegat, put there to fight the Baltic with storm-lashed guns, on which the sea-salt cakes!

4TH NANTUCKET SAILOR. He has his orders, mind ye that. I heard old Ahab tell him he must always kill a squall, something as they burst a waterspout with a pistol—fire your ship right into it!

ENGLISH SAILOR. Blood! but that old man’s a grand old cove! We are the lads to hunt him up his whale!

ALL. Aye! aye!

OLD MANX SAILOR. How the three pines shake! Pines are the hardest sort of tree to live when shifted to any other soil, and here there’s none but the crew’s cursed clay. Steady, helmsman! steady. This is the sort of weather when brave hearts snap ashore, and keeled hulls split at sea. Our captain has his birthmark; look yonder, boys, there’s another in the sky—lurid-like, ye see, all else pitch black.

DAGGOO. What of that? Who’s afraid of black’s afraid of me! I’m quarried out of it!

SPANISH SAILOR. (Aside.) He wants to bully, ah!—the old grudge makes me touchy (Advancing.) Aye, harpooneer, thy race is the undeniable dark side of mankind—devilish dark at that. No offence.

DAGGOO (grimly). None.

ST. JAGO’S SAILOR. That Spaniard’s mad or drunk. But that can’t be, or else in his one case our old Mogul’s fire-waters are somewhat long in working.

5TH NANTUCKET SAILOR. What’s that I saw—lightning? Yes.

SPANISH SAILOR. No; Daggoo showing his teeth.

DAGGOO (springing). Swallow thine, mannikin! White skin, white liver!

SPANISH SAILOR (meeting him). Knife thee heartily! big frame, small spirit!

ALL. A row! a row! a row!

TASHTEGO (with a whiff). A row a’low, and a row aloft—Gods and men—both brawlers! Humph!

BELFAST SAILOR. A row! arrah a row! The Virgin be blessed, a row! Plunge in with ye!

ENGLISH SAILOR. Fair play! Snatch the Spaniard’s knife! A ring, a ring!

OLD MANX SAILOR. Ready formed. There! the ringed horizon. In that ring Cain struck Abel. Sweet work, right work! No? Why then, God, mad’st thou the ring?

MATE’S VOICE FROM THE QUARTER-DECK. Hands by the halyards! in top-gallant sails! Stand by to reef topsails!

ALL. The squall! the squall! jump, my jollies! (They scatter.)

PIP (shrinking under the windlass). Jollies? Lord help such jollies! Crish, crash! there goes the jib-stay! Blang-whang! God! Duck lower, Pip, here comes the royal yard! It’s worse than being in the whirled woods, the last day of the year! Who’d go climbing after chestnuts now? But there they go, all cursing, and here I don’t. Fine prospects to ’em; they’re on the road to heaven. Hold on hard! Jimmini, what a squall! But those chaps there are worse yet—they are your white squalls, they. White squalls? white whale, shirr! shirr! Here have I heard all their chat just now, and the white whale—shirr! shirr!—but spoken of once! and only this evening—it makes me jingle all over like my tambourine—that anaconda of an old man swore ’em in to hunt him! Oh, thou big white God aloft there somewhere in yon darkness, have mercy on this small black boy down here; preserve him from all men that have no bowels to feel fear!






CHAPTER 41. Moby Dick.
I, Ishmael, was one of that crew; my shouts had gone up with the rest; my oath had been welded with theirs; and stronger I shouted, and more did I hammer and clinch my oath, because of the dread in my soul. A wild, mystical, sympathetical feeling was in me; Ahab’s quenchless feud seemed mine. With greedy ears I learned the history of that murderous monster against whom I and all the others had taken our oaths of violence and revenge.

For some time past, though at intervals only, the unaccompanied, secluded White Whale had haunted those uncivilized seas mostly frequented by the Sperm Whale fishermen. But not all of them knew of his existence; only a few of them, comparatively, had knowingly seen him; while the number who as yet had actually and knowingly given battle to him, was small indeed. For, owing to the large number of whale-cruisers; the disorderly way they were sprinkled over the entire watery circumference, many of them adventurously pushing their quest along solitary latitudes, so as seldom or never for a whole twelvemonth or more on a stretch, to encounter a single news-telling sail of any sort; the inordinate length of each separate voyage; the irregularity of the times of sailing from home; all these, with other circumstances, direct and indirect, long obstructed the spread through the whole world-wide whaling-fleet of the special individualizing tidings concerning Moby Dick. It was hardly to be doubted, that several vessels reported to have encountered, at such or such a time, or on such or such a meridian, a Sperm Whale of uncommon magnitude and malignity, which whale, after doing great mischief to his assailants, had completely escaped them; to some minds it was not an unfair presumption, I say, that the whale in question must have been no other than Moby Dick. Yet as of late the Sperm Whale fishery had been marked by various and not unfrequent instances of great ferocity, cunning, and malice in the monster attacked; therefore it was, that those who by accident ignorantly gave battle to Moby Dick; such hunters, perhaps, for the most part, were content to ascribe the peculiar terror he bred, more, as it were, to the perils of the Sperm Whale fishery at large, than to the individual cause. In that way, mostly, the disastrous encounter between Ahab and the whale had hitherto been popularly regarded.

And as for those who, previously hearing of the White Whale, by chance caught sight of him; in the beginning of the thing they had every one of them, almost, as boldly and fearlessly lowered for him, as for any other whale of that species. But at length, such calamities did ensue in these assaults—not restricted to sprained wrists and ankles, broken limbs, or devouring amputations—but fatal to the last degree of fatality; those repeated disastrous repulses, all accumulating and piling their terrors upon Moby Dick; those things had gone far to shake the fortitude of many brave hunters, to whom the story of the White Whale had eventually come.

Nor did wild rumors of all sorts fail to exaggerate, and still the more horrify the true histories of these deadly encounters. For not only do fabulous rumors naturally grow out of the very body of all surprising terrible events,—as the smitten tree gives birth to its fungi; but, in maritime life, far more than in that of terra firma, wild rumors abound, wherever there is any adequate reality for them to cling to. And as the sea surpasses the land in this matter, so the whale fishery surpasses every other sort of maritime life, in the wonderfulness and fearfulness of the rumors which sometimes circulate there. For not only are whalemen as a body unexempt from that ignorance and superstitiousness hereditary to all sailors; but of all sailors, they are by all odds the most directly brought into contact with whatever is appallingly astonishing in the sea; face to face they not only eye its greatest marvels, but, hand to jaw, give battle to them. Alone, in such remotest waters, that though you sailed a thousand miles, and passed a thousand shores, you would not come to any chiseled hearth-stone, or aught hospitable beneath that part of the sun; in such latitudes and longitudes, pursuing too such a calling as he does, the whaleman is wrapped by influences all tending to make his fancy pregnant with many a mighty birth.

No wonder, then, that ever gathering volume from the mere transit over the widest watery spaces, the outblown rumors of the White Whale did in the end incorporate with themselves all manner of morbid hints, and half-formed fœtal suggestions of supernatural agencies, which eventually invested Moby Dick with new terrors unborrowed from anything that visibly appears. So that in many cases such a panic did he finally strike, that few who by those rumors, at least, had heard of the White Whale, few of those hunters were willing to encounter the perils of his jaw.

But there were still other and more vital practical influences at work. Not even at the present day has the original prestige of the Sperm Whale, as fearfully distinguished from all other species of the leviathan, died out of the minds of the whalemen as a body. There are those this day among them, who, though intelligent and courageous enough in offering battle to the Greenland or Right whale, would perhaps—either from professional inexperience, or incompetency, or timidity, decline a contest with the Sperm Whale; at any rate, there are plenty of whalemen, especially among those whaling nations not sailing under the American flag, who have never hostilely encountered the Sperm Whale, but whose sole knowledge of the leviathan is restricted to the ignoble monster primitively pursued in the North; seated on their hatches, these men will hearken with a childish fireside interest and awe, to the wild, strange tales of Southern whaling. Nor is the pre-eminent tremendousness of the great Sperm Whale anywhere more feelingly comprehended, than on board of those prows which stem him.

And as if the now tested reality of his might had in former legendary times thrown its shadow before it; we find some book naturalists—Olassen and Povelson—declaring the Sperm Whale not only to be a consternation to every other creature in the sea, but also to be so incredibly ferocious as continually to be athirst for human blood. Nor even down to so late a time as Cuvier’s, were these or almost similar impressions effaced. For in his Natural History, the Baron himself affirms that at sight of the Sperm Whale, all fish (sharks included) are “struck with the most lively terrors,” and “often in the precipitancy of their flight dash themselves against the rocks with such violence as to cause instantaneous death.” And however the general experiences in the fishery may amend such reports as these; yet in their full terribleness, even to the bloodthirsty item of Povelson, the superstitious belief in them is, in some vicissitudes of their vocation, revived in the minds of the hunters.

So that overawed by the rumors and portents concerning him, not a few of the fishermen recalled, in reference to Moby Dick, the earlier days of the Sperm Whale fishery, when it was oftentimes hard to induce long practised Right whalemen to embark in the perils of this new and daring warfare; such men protesting that although other leviathans might be hopefully pursued, yet to chase and point lance at such an apparition as the Sperm Whale was not for mortal man. That to attempt it, would be inevitably to be torn into a quick eternity. On this head, there are some remarkable documents that may be consulted.

Nevertheless, some there were, who even in the face of these things were ready to give chase to Moby Dick; and a still greater number who, chancing only to hear of him distantly and vaguely, without the specific details of any certain calamity, and without superstitious accompaniments, were sufficiently hardy not to flee from the battle if offered.

One of the wild suggestions referred to, as at last coming to be linked with the White Whale in the minds of the superstitiously inclined, was the unearthly conceit that Moby Dick was ubiquitous; that he had actually been encountered in opposite latitudes at one and the same instant of time.

Nor, credulous as such minds must have been, was this conceit altogether without some faint show of superstitious probability. For as the secrets of the currents in the seas have never yet been divulged, even to the most erudite research; so the hidden ways of the Sperm Whale when beneath the surface remain, in great part, unaccountable to his pursuers; and from time to time have originated the most curious and contradictory speculations regarding them, especially concerning the mystic modes whereby, after sounding to a great depth, he transports himself with such vast swiftness to the most widely distant points.

It is a thing well known to both American and English whale-ships, and as well a thing placed upon authoritative record years ago by Scoresby, that some whales have been captured far north in the Pacific, in whose bodies have been found the barbs of harpoons darted in the Greenland seas. Nor is it to be gainsaid, that in some of these instances it has been declared that the interval of time between the two assaults could not have exceeded very many days. Hence, by inference, it has been believed by some whalemen, that the Nor’ West Passage, so long a problem to man, was never a problem to the whale. So that here, in the real living experience of living men, the prodigies related in old times of the inland Strello mountain in Portugal (near whose top there was said to be a lake in which the wrecks of ships floated up to the surface); and that still more wonderful story of the Arethusa fountain near Syracuse (whose waters were believed to have come from the Holy Land by an underground passage); these fabulous narrations are almost fully equalled by the realities of the whalemen.

Forced into familiarity, then, with such prodigies as these; and knowing that after repeated, intrepid assaults, the White Whale had escaped alive; it cannot be much matter of surprise that some whalemen should go still further in their superstitions; declaring Moby Dick not only ubiquitous, but immortal (for immortality is but ubiquity in time); that though groves of spears should be planted in his flanks, he would still swim away unharmed; or if indeed he should ever be made to spout thick blood, such a sight would be but a ghastly deception; for again in unensanguined billows hundreds of leagues away, his unsullied jet would once more be seen.

But even stripped of these supernatural surmisings, there was enough in the earthly make and incontestable character of the monster to strike the imagination with unwonted power. For, it was not so much his uncommon bulk that so much distinguished him from other sperm whales, but, as was elsewhere thrown out—a peculiar snow-white wrinkled forehead, and a high, pyramidical white hump. These were his prominent features; the tokens whereby, even in the limitless, uncharted seas, he revealed his identity, at a long distance, to those who knew him.

The rest of his body was so streaked, and spotted, and marbled with the same shrouded hue, that, in the end, he had gained his distinctive appellation of the White Whale; a name, indeed, literally justified by his vivid aspect, when seen gliding at high noon through a dark blue sea, leaving a milky-way wake of creamy foam, all spangled with golden gleamings.

Nor was it his unwonted magnitude, nor his remarkable hue, nor yet his deformed lower jaw, that so much invested the whale with natural terror, as that unexampled, intelligent malignity which, according to specific accounts, he had over and over again evinced in his assaults. More than all, his treacherous retreats struck more of dismay than perhaps aught else. For, when swimming before his exulting pursuers, with every apparent symptom of alarm, he had several times been known to turn round suddenly, and, bearing down upon them, either stave their boats to splinters, or drive them back in consternation to their ship.

Already several fatalities had attended his chase. But though similar disasters, however little bruited ashore, were by no means unusual in the fishery; yet, in most instances, such seemed the White Whale’s infernal aforethought of ferocity, that every dismembering or death that he caused, was not wholly regarded as having been inflicted by an unintelligent agent.

Judge, then, to what pitches of inflamed, distracted fury the minds of his more desperate hunters were impelled, when amid the chips of chewed boats, and the sinking limbs of torn comrades, they swam out of the white curds of the whale’s direful wrath into the serene, exasperating sunlight, that smiled on, as if at a birth or a bridal.

His three boats stove around him, and oars and men both whirling in the eddies; one captain, seizing the line-knife from his broken prow, had dashed at the whale, as an Arkansas duellist at his foe, blindly seeking with a six inch blade to reach the fathom-deep life of the whale. That captain was Ahab. And then it was, that suddenly sweeping his sickle-shaped lower jaw beneath him, Moby Dick had reaped away Ahab’s leg, as a mower a blade of grass in the field. No turbaned Turk, no hired Venetian or Malay, could have smote him with more seeming malice. Small reason was there to doubt, then, that ever since that almost fatal encounter, Ahab had cherished a wild vindictiveness against the whale, all the more fell for that in his frantic morbidness he at last came to identify with him, not only all his bodily woes, but all his intellectual and spiritual exasperations. The White Whale swam before him as the monomaniac incarnation of all those malicious agencies which some deep men feel eating in them, till they are left living on with half a heart and half a lung. That intangible malignity which has been from the beginning; to whose dominion even the modern Christians ascribe one-half of the worlds; which the ancient Ophites of the east reverenced in their statue devil;—Ahab did not fall down and worship it like them; but deliriously transferring its idea to the abhorred white whale, he pitted himself, all mutilated, against it. All that most maddens and torments; all that stirs up the lees of things; all truth with malice in it; all that cracks the sinews and cakes the brain; all the subtle demonisms of life and thought; all evil, to crazy Ahab, were visibly personified, and made practically assailable in Moby Dick. He piled upon the whale’s white hump the sum of all the general rage and hate felt by his whole race from Adam down; and then, as if his chest had been a mortar, he burst his hot heart’s shell upon it.

It is not probable that this monomania in him took its instant rise at the precise time of his bodily dismemberment. Then, in darting at the monster, knife in hand, he had but given loose to a sudden, passionate, corporal animosity; and when he received the stroke that tore him, he probably but felt the agonizing bodily laceration, but nothing more. Yet, when by this collision forced to turn towards home, and for long months of days and weeks, Ahab and anguish lay stretched together in one hammock, rounding in mid winter that dreary, howling Patagonian Cape; then it was, that his torn body and gashed soul bled into one another; and so interfusing, made him mad. That it was only then, on the homeward voyage, after the encounter, that the final monomania seized him, seems all but certain from the fact that, at intervals during the passage, he was a raving lunatic; and, though unlimbed of a leg, yet such vital strength yet lurked in his Egyptian chest, and was moreover intensified by his delirium, that his mates were forced to lace him fast, even there, as he sailed, raving in his hammock. In a strait-jacket, he swung to the mad rockings of the gales. And, when running into more sufferable latitudes, the ship, with mild stun’sails spread, floated across the tranquil tropics, and, to all appearances, the old man’s delirium seemed left behind him with the Cape Horn swells, and he came forth from his dark den into the blessed light and air; even then, when he bore that firm, collected front, however pale, and issued his calm orders once again; and his mates thanked God the direful madness was now gone; even then, Ahab, in his hidden self, raved on. Human madness is oftentimes a cunning and most feline thing. When you think it fled, it may have but become transfigured into some still subtler form. Ahab’s full lunacy subsided not, but deepeningly contracted; like the unabated Hudson, when that noble Northman flows narrowly, but unfathomably through the Highland gorge. But, as in his narrow-flowing monomania, not one jot of Ahab’s broad madness had been left behind; so in that broad madness, not one jot of his great natural intellect had perished. That before living agent, now became the living instrument. If such a furious trope may stand, his special lunacy stormed his general sanity, and carried it, and turned all its concentred cannon upon its own mad mark; so that far from having lost his strength, Ahab, to that one end, did now possess a thousand fold more potency than ever he had sanely brought to bear upon any one reasonable object.

This is much; yet Ahab’s larger, darker, deeper part remains unhinted. But vain to popularize profundities, and all truth is profound. Winding far down from within the very heart of this spiked Hotel de Cluny where we here stand—however grand and wonderful, now quit it;—and take your way, ye nobler, sadder souls, to those vast Roman halls of Thermes; where far beneath the fantastic towers of man’s upper earth, his root of grandeur, his whole awful essence sits in bearded state; an antique buried beneath antiquities, and throned on torsoes! So with a broken throne, the great gods mock that captive king; so like a Caryatid, he patient sits, upholding on his frozen brow the piled entablatures of ages. Wind ye down there, ye prouder, sadder souls! question that proud, sad king! A family likeness! aye, he did beget ye, ye young exiled royalties; and from your grim sire only will the old State-secret come.

Now, in his heart, Ahab had some glimpse of this, namely: all my means are sane, my motive and my object mad. Yet without power to kill, or change, or shun the fact; he likewise knew that to mankind he did long dissemble; in some sort, did still. But that thing of his dissembling was only subject to his perceptibility, not to his will determinate. Nevertheless, so well did he succeed in that dissembling, that when with ivory leg he stepped ashore at last, no Nantucketer thought him otherwise than but naturally grieved, and that to the quick, with the terrible casualty which had overtaken him.

The report of his undeniable delirium at sea was likewise popularly ascribed to a kindred cause. And so too, all the added moodiness which always afterwards, to the very day of sailing in the Pequod on the present voyage, sat brooding on his brow. Nor is it so very unlikely, that far from distrusting his fitness for another whaling voyage, on account of such dark symptoms, the calculating people of that prudent isle were inclined to harbor the conceit, that for those very reasons he was all the better qualified and set on edge, for a pursuit so full of rage and wildness as the bloody hunt of whales. Gnawed within and scorched without, with the infixed, unrelenting fangs of some incurable idea; such an one, could he be found, would seem the very man to dart his iron and lift his lance against the most appalling of all brutes. Or, if for any reason thought to be corporeally incapacitated for that, yet such an one would seem superlatively competent to cheer and howl on his underlings to the attack. But be all this as it may, certain it is, that with the mad secret of his unabated rage bolted up and keyed in him, Ahab had purposely sailed upon the present voyage with the one only and all-engrossing object of hunting the White Whale. Had any one of his old acquaintances on shore but half dreamed of what was lurking in him then, how soon would their aghast and righteous souls have wrenched the ship from such a fiendish man! They were bent on profitable cruises, the profit to be counted down in dollars from the mint. He was intent on an audacious, immitigable, and supernatural revenge.

Here, then, was this grey-headed, ungodly old man, chasing with curses a Job’s whale round the world, at the head of a crew, too, chiefly made up of mongrel renegades, and castaways, and cannibals—morally enfeebled also, by the incompetence of mere unaided virtue or right-mindedness in Starbuck, the invulnerable jollity of indifference and recklessness in Stubb, and the pervading mediocrity in Flask. Such a crew, so officered, seemed specially picked and packed by some infernal fatality to help him to his monomaniac revenge. How it was that they so aboundingly responded to the old man’s ire—by what evil magic their souls were possessed, that at times his hate seemed almost theirs; the White Whale as much their insufferable foe as his; how all this came to be—what the White Whale was to them, or how to their unconscious understandings, also, in some dim, unsuspected way, he might have seemed the gliding great demon of the seas of life,—all this to explain, would be to dive deeper than Ishmael can go. The subterranean miner that works in us all, how can one tell whither leads his shaft by the ever shifting, muffled sound of his pick? Who does not feel the irresistible arm drag? What skiff in tow of a seventy-four can stand still? For one, I gave myself up to the abandonment of the time and the place; but while yet all a-rush to encounter the whale, could see naught in that brute but the deadliest ill.






CHAPTER 42. The Whiteness of the Whale.
What the white whale was to Ahab, has been hinted; what, at times, he was to me, as yet remains unsaid.

Aside from those more obvious considerations touching Moby Dick, which could not but occasionally awaken in any man’s soul some alarm, there was another thought, or rather vague, nameless horror concerning him, which at times by its intensity completely overpowered all the rest; and yet so mystical and well nigh ineffable was it, that I almost despair of putting it in a comprehensible form. It was the whiteness of the whale that above all things appalled me. But how can I hope to explain myself here; and yet, in some dim, random way, explain myself I must, else all these chapters might be naught.

Though in many natural objects, whiteness refiningly enhances beauty, as if imparting some special virtue of its own, as in marbles, japonicas, and pearls; and though various nations have in some way recognised a certain royal preeminence in this hue; even the barbaric, grand old kings of Pegu placing the title “Lord of the White Elephants” above all their other magniloquent ascriptions of dominion; and the modern kings of Siam unfurling the same snow-white quadruped in the royal standard; and the Hanoverian flag bearing the one figure of a snow-white charger; and the great Austrian Empire, Cæsarian, heir to overlording Rome, having for the imperial colour the same imperial hue; and though this pre-eminence in it applies to the human race itself, giving the white man ideal mastership over every dusky tribe; and though, besides, all this, whiteness has been even made significant of gladness, for among the Romans a white stone marked a joyful day; and though in other mortal sympathies and symbolizings, this same hue is made the emblem of many touching, noble things—the innocence of brides, the benignity of age; though among the Red Men of America the giving of the white belt of wampum was the deepest pledge of honor; though in many climes, whiteness typifies the majesty of Justice in the ermine of the Judge, and contributes to the daily state of kings and queens drawn by milk-white steeds; though even in the higher mysteries of the most august religions it has been made the symbol of the divine spotlessness and power; by the Persian fire worshippers, the white forked flame being held the holiest on the altar; and in the Greek mythologies, Great Jove himself being made incarnate in a snow-white bull; and though to the noble Iroquois, the midwinter sacrifice of the sacred White Dog was by far the holiest festival of their theology, that spotless, faithful creature being held the purest envoy they could send to the Great Spirit with the annual tidings of their own fidelity; and though directly from the Latin word for white, all Christian priests derive the name of one part of their sacred vesture, the alb or tunic, worn beneath the cassock; and though among the holy pomps of the Romish faith, white is specially employed in the celebration of the Passion of our Lord; though in the Vision of St. John, white robes are given to the redeemed, and the four-and-twenty elders stand clothed in white before the great white throne, and the Holy One that sitteth there white like wool; yet for all these accumulated associations, with whatever is sweet, and honorable, and sublime, there yet lurks an elusive something in the innermost idea of this hue, which strikes more of panic to the soul than that redness which affrights in blood.

This elusive quality it is, which causes the thought of whiteness, when divorced from more kindly associations, and coupled with any object terrible in itself, to heighten that terror to the furthest bounds. Witness the white bear of the poles, and the white shark of the tropics; what but their smooth, flaky whiteness makes them the transcendent horrors they are? That ghastly whiteness it is which imparts such an abhorrent mildness, even more loathsome than terrific, to the dumb gloating of their aspect. So that not the fierce-fanged tiger in his heraldic coat can so stagger courage as the white-shrouded bear or shark.*

*With reference to the Polar bear, it may possibly be urged by him who would fain go still deeper into this matter, that it is not the whiteness, separately regarded, which heightens the intolerable hideousness of that brute; for, analysed, that heightened hideousness, it might be said, only rises from the circumstance, that the irresponsible ferociousness of the creature stands invested in the fleece of celestial innocence and love; and hence, by bringing together two such opposite emotions in our minds, the Polar bear frightens us with so unnatural a contrast. But even assuming all this to be true; yet, were it not for the whiteness, you would not have that intensified terror.

As for the white shark, the white gliding ghostliness of repose in that creature, when beheld in his ordinary moods, strangely tallies with the same quality in the Polar quadruped. This peculiarity is most vividly hit by the French in the name they bestow upon that fish. The Romish mass for the dead begins with “Requiem eternam” (eternal rest), whence Requiem denominating the mass itself, and any other funeral music. Now, in allusion to the white, silent stillness of death in this shark, and the mild deadliness of his habits, the French call him Requin.

Bethink thee of the albatross, whence come those clouds of spiritual wonderment and pale dread, in which that white phantom sails in all imaginations? Not Coleridge first threw that spell; but God’s great, unflattering laureate, Nature.*

*I remember the first albatross I ever saw. It was during a prolonged gale, in waters hard upon the Antarctic seas. From my forenoon watch below, I ascended to the overclouded deck; and there, dashed upon the main hatches, I saw a regal, feathery thing of unspotted whiteness, and with a hooked, Roman bill sublime. At intervals, it arched forth its vast archangel wings, as if to embrace some holy ark. Wondrous flutterings and throbbings shook it. Though bodily unharmed, it uttered cries, as some king’s ghost in supernatural distress. Through its inexpressible, strange eyes, methought I peeped to secrets which took hold of God. As Abraham before the angels, I bowed myself; the white thing was so white, its wings so wide, and in those for ever exiled waters, I had lost the miserable warping memories of traditions and of towns. Long I gazed at that prodigy of plumage. I cannot tell, can only hint, the things that darted through me then. But at last I awoke; and turning, asked a sailor what bird was this. A goney, he replied. Goney! never had heard that name before; is it conceivable that this glorious thing is utterly unknown to men ashore! never! But some time after, I learned that goney was some seaman’s name for albatross. So that by no possibility could Coleridge’s wild Rhyme have had aught to do with those mystical impressions which were mine, when I saw that bird upon our deck. For neither had I then read the Rhyme, nor knew the bird to be an albatross. Yet, in saying this, I do but indirectly burnish a little brighter the noble merit of the poem and the poet.

I assert, then, that in the wondrous bodily whiteness of the bird chiefly lurks the secret of the spell; a truth the more evinced in this, that by a solecism of terms there are birds called grey albatrosses; and these I have frequently seen, but never with such emotions as when I beheld the Antarctic fowl.

But how had the mystic thing been caught? Whisper it not, and I will tell; with a treacherous hook and line, as the fowl floated on the sea. At last the Captain made a postman of it; tying a lettered, leathern tally round its neck, with the ship’s time and place; and then letting it escape. But I doubt not, that leathern tally, meant for man, was taken off in Heaven, when the white fowl flew to join the wing-folding, the invoking, and adoring cherubim!

Most famous in our Western annals and Indian traditions is that of the White Steed of the Prairies; a magnificent milk-white charger, large-eyed, small-headed, bluff-chested, and with the dignity of a thousand monarchs in his lofty, overscorning carriage. He was the elected Xerxes of vast herds of wild horses, whose pastures in those days were only fenced by the Rocky Mountains and the Alleghanies. At their flaming head he westward trooped it like that chosen star which every evening leads on the hosts of light. The flashing cascade of his mane, the curving comet of his tail, invested him with housings more resplendent than gold and silver-beaters could have furnished him. A most imperial and archangelical apparition of that unfallen, western world, which to the eyes of the old trappers and hunters revived the glories of those primeval times when Adam walked majestic as a god, bluff-browed and fearless as this mighty steed. Whether marching amid his aides and marshals in the van of countless cohorts that endlessly streamed it over the plains, like an Ohio; or whether with his circumambient subjects browsing all around at the horizon, the White Steed gallopingly reviewed them with warm nostrils reddening through his cool milkiness; in whatever aspect he presented himself, always to the bravest Indians he was the object of trembling reverence and awe. Nor can it be questioned from what stands on legendary record of this noble horse, that it was his spiritual whiteness chiefly, which so clothed him with divineness; and that this divineness had that in it which, though commanding worship, at the same time enforced a certain nameless terror.

But there are other instances where this whiteness loses all that accessory and strange glory which invests it in the White Steed and Albatross.

What is it that in the Albino man so peculiarly repels and often shocks the eye, as that sometimes he is loathed by his own kith and kin! It is that whiteness which invests him, a thing expressed by the name he bears. The Albino is as well made as other men—has no substantive deformity—and yet this mere aspect of all-pervading whiteness makes him more strangely hideous than the ugliest abortion. Why should this be so?

Nor, in quite other aspects, does Nature in her least palpable but not the less malicious agencies, fail to enlist among her forces this crowning attribute of the terrible. From its snowy aspect, the gauntleted ghost of the Southern Seas has been denominated the White Squall. Nor, in some historic instances, has the art of human malice omitted so potent an auxiliary. How wildly it heightens the effect of that passage in Froissart, when, masked in the snowy symbol of their faction, the desperate White Hoods of Ghent murder their bailiff in the market-place!

Nor, in some things, does the common, hereditary experience of all mankind fail to bear witness to the supernaturalism of this hue. It cannot well be doubted, that the one visible quality in the aspect of the dead which most appals the gazer, is the marble pallor lingering there; as if indeed that pallor were as much like the badge of consternation in the other world, as of mortal trepidation here. And from that pallor of the dead, we borrow the expressive hue of the shroud in which we wrap them. Nor even in our superstitions do we fail to throw the same snowy mantle round our phantoms; all ghosts rising in a milk-white fog—Yea, while these terrors seize us, let us add, that even the king of terrors, when personified by the evangelist, rides on his pallid horse.

Therefore, in his other moods, symbolize whatever grand or gracious thing he will by whiteness, no man can deny that in its profoundest idealized significance it calls up a peculiar apparition to the soul.

But though without dissent this point be fixed, how is mortal man to account for it? To analyse it, would seem impossible. Can we, then, by the citation of some of those instances wherein this thing of whiteness—though for the time either wholly or in great part stripped of all direct associations calculated to impart to it aught fearful, but nevertheless, is found to exert over us the same sorcery, however modified;—can we thus hope to light upon some chance clue to conduct us to the hidden cause we seek?

Let us try. But in a matter like this, subtlety appeals to subtlety, and without imagination no man can follow another into these halls. And though, doubtless, some at least of the imaginative impressions about to be presented may have been shared by most men, yet few perhaps were entirely conscious of them at the time, and therefore may not be able to recall them now.

Why to the man of untutored ideality, who happens to be but loosely acquainted with the peculiar character of the day, does the bare mention of Whitsuntide marshal in the fancy such long, dreary, speechless processions of slow-pacing pilgrims, down-cast and hooded with new-fallen snow? Or, to the unread, unsophisticated Protestant of the Middle American States, why does the passing mention of a White Friar or a White Nun, evoke such an eyeless statue in the soul?

Or what is there apart from the traditions of dungeoned warriors and kings (which will not wholly account for it) that makes the White Tower of London tell so much more strongly on the imagination of an untravelled American, than those other storied structures, its neighbors—the Byward Tower, or even the Bloody? And those sublimer towers, the White Mountains of New Hampshire, whence, in peculiar moods, comes that gigantic ghostliness over the soul at the bare mention of that name, while the thought of Virginia’s Blue Ridge is full of a soft, dewy, distant dreaminess? Or why, irrespective of all latitudes and longitudes, does the name of the White Sea exert such a spectralness over the fancy, while that of the Yellow Sea lulls us with mortal thoughts of long lacquered mild afternoons on the waves, followed by the gaudiest and yet sleepiest of sunsets? Or, to choose a wholly unsubstantial instance, purely addressed to the fancy, why, in reading the old fairy tales of Central Europe, does “the tall pale man” of the Hartz forests, whose changeless pallor unrustlingly glides through the green of the groves—why is this phantom more terrible than all the whooping imps of the Blocksburg?

Nor is it, altogether, the remembrance of her cathedral-toppling earthquakes; nor the stampedoes of her frantic seas; nor the tearlessness of arid skies that never rain; nor the sight of her wide field of leaning spires, wrenched cope-stones, and crosses all adroop (like canted yards of anchored fleets); and her suburban avenues of house-walls lying over upon each other, as a tossed pack of cards;—it is not these things alone which make tearless Lima, the strangest, saddest city thou can’st see. For Lima has taken the white veil; and there is a higher horror in this whiteness of her woe. Old as Pizarro, this whiteness keeps her ruins for ever new; admits not the cheerful greenness of complete decay; spreads over her broken ramparts the rigid pallor of an apoplexy that fixes its own distortions.

I know that, to the common apprehension, this phenomenon of whiteness is not confessed to be the prime agent in exaggerating the terror of objects otherwise terrible; nor to the unimaginative mind is there aught of terror in those appearances whose awfulness to another mind almost solely consists in this one phenomenon, especially when exhibited under any form at all approaching to muteness or universality. What I mean by these two statements may perhaps be respectively elucidated by the following examples.

First: The mariner, when drawing nigh the coasts of foreign lands, if by night he hear the roar of breakers, starts to vigilance, and feels just enough of trepidation to sharpen all his faculties; but under precisely similar circumstances, let him be called from his hammock to view his ship sailing through a midnight sea of milky whiteness—as if from encircling headlands shoals of combed white bears were swimming round him, then he feels a silent, superstitious dread; the shrouded phantom of the whitened waters is horrible to him as a real ghost; in vain the lead assures him he is still off soundings; heart and helm they both go down; he never rests till blue water is under him again. Yet where is the mariner who will tell thee, “Sir, it was not so much the fear of striking hidden rocks, as the fear of that hideous whiteness that so stirred me?”

Second: To the native Indian of Peru, the continual sight of the snow-howdahed Andes conveys naught of dread, except, perhaps, in the mere fancying of the eternal frosted desolateness reigning at such vast altitudes, and the natural conceit of what a fearfulness it would be to lose oneself in such inhuman solitudes. Much the same is it with the backwoodsman of the West, who with comparative indifference views an unbounded prairie sheeted with driven snow, no shadow of tree or twig to break the fixed trance of whiteness. Not so the sailor, beholding the scenery of the Antarctic seas; where at times, by some infernal trick of legerdemain in the powers of frost and air, he, shivering and half shipwrecked, instead of rainbows speaking hope and solace to his misery, views what seems a boundless churchyard grinning upon him with its lean ice monuments and splintered crosses.

But thou sayest, methinks that white-lead chapter about whiteness is but a white flag hung out from a craven soul; thou surrenderest to a hypo, Ishmael.

Tell me, why this strong young colt, foaled in some peaceful valley of Vermont, far removed from all beasts of prey—why is it that upon the sunniest day, if you but shake a fresh buffalo robe behind him, so that he cannot even see it, but only smells its wild animal muskiness—why will he start, snort, and with bursting eyes paw the ground in phrensies of affright? There is no remembrance in him of any gorings of wild creatures in his green northern home, so that the strange muskiness he smells cannot recall to him anything associated with the experience of former perils; for what knows he, this New England colt, of the black bisons of distant Oregon?

No: but here thou beholdest even in a dumb brute, the instinct of the knowledge of the demonism in the world. Though thousands of miles from Oregon, still when he smells that savage musk, the rending, goring bison herds are as present as to the deserted wild foal of the prairies, which this instant they may be trampling into dust.

Thus, then, the muffled rollings of a milky sea; the bleak rustlings of the festooned frosts of mountains; the desolate shiftings of the windrowed snows of prairies; all these, to Ishmael, are as the shaking of that buffalo robe to the frightened colt!

Though neither knows where lie the nameless things of which the mystic sign gives forth such hints; yet with me, as with the colt, somewhere those things must exist. Though in many of its aspects this visible world seems formed in love, the invisible spheres were formed in fright.

But not yet have we solved the incantation of this whiteness, and learned why it appeals with such power to the soul; and more strange and far more portentous—why, as we have seen, it is at once the most meaning symbol of spiritual things, nay, the very veil of the Christian’s Deity; and yet should be as it is, the intensifying agent in things the most appalling to mankind.

Is it that by its indefiniteness it shadows forth the heartless voids and immensities of the universe, and thus stabs us from behind with the thought of annihilation, when beholding the white depths of the milky way? Or is it, that as in essence whiteness is not so much a colour as the visible absence of colour; and at the same time the concrete of all colours; is it for these reasons that there is such a dumb blankness, full of meaning, in a wide landscape of snows—a colourless, all-colour of atheism from which we shrink? And when we consider that other theory of the natural philosophers, that all other earthly hues—every stately or lovely emblazoning—the sweet tinges of sunset skies and woods; yea, and the gilded velvets of butterflies, and the butterfly cheeks of young girls; all these are but subtile deceits, not actually inherent in substances, but only laid on from without; so that all deified Nature absolutely paints like the harlot, whose allurements cover nothing but the charnel-house within; and when we proceed further, and consider that the mystical cosmetic which produces every one of her hues, the great principle of light, for ever remains white or colorless in itself, and if operating without medium upon matter, would touch all objects, even tulips and roses, with its own blank tinge—pondering all this, the palsied universe lies before us a leper; and like wilful travellers in Lapland, who refuse to wear coloured and colouring glasses upon their eyes, so the wretched infidel gazes himself blind at the monumental white shroud that wraps all the prospect around him. And of all these things the Albino whale was the symbol. Wonder ye then at the fiery hunt?






CHAPTER 43. Hark!
“HIST! Did you hear that noise, Cabaco?”

It was the middle-watch: a fair moonlight; the seamen were standing in a cordon, extending from one of the fresh-water butts in the waist, to the scuttle-butt near the taffrail. In this manner, they passed the buckets to fill the scuttle-butt. Standing, for the most part, on the hallowed precincts of the quarter-deck, they were careful not to speak or rustle their feet. From hand to hand, the buckets went in the deepest silence, only broken by the occasional flap of a sail, and the steady hum of the unceasingly advancing keel.

It was in the midst of this repose, that Archy, one of the cordon, whose post was near the after-hatches, whispered to his neighbor, a Cholo, the words above.

“Hist! did you hear that noise, Cabaco?”

“Take the bucket, will ye, Archy? what noise d’ye mean?”

“There it is again—under the hatches—don’t you hear it—a cough—it sounded like a cough.”

“Cough be damned! Pass along that return bucket.”

“There again—there it is!—it sounds like two or three sleepers turning over, now!”

“Caramba! have done, shipmate, will ye? It’s the three soaked biscuits ye eat for supper turning over inside of ye—nothing else. Look to the bucket!”

“Say what ye will, shipmate; I’ve sharp ears.”

“Aye, you are the chap, ain’t ye, that heard the hum of the old Quakeress’s knitting-needles fifty miles at sea from Nantucket; you’re the chap.”

“Grin away; we’ll see what turns up. Hark ye, Cabaco, there is somebody down in the after-hold that has not yet been seen on deck; and I suspect our old Mogul knows something of it too. I heard Stubb tell Flask, one morning watch, that there was something of that sort in the wind.”

“Tish! the bucket!”






CHAPTER 44. The Chart.
Had you followed Captain Ahab down into his cabin after the squall that took place on the night succeeding that wild ratification of his purpose with his crew, you would have seen him go to a locker in the transom, and bringing out a large wrinkled roll of yellowish sea charts, spread them before him on his screwed-down table. Then seating himself before it, you would have seen him intently study the various lines and shadings which there met his eye; and with slow but steady pencil trace additional courses over spaces that before were blank. At intervals, he would refer to piles of old log-books beside him, wherein were set down the seasons and places in which, on various former voyages of various ships, sperm whales had been captured or seen.

While thus employed, the heavy pewter lamp suspended in chains over his head, continually rocked with the motion of the ship, and for ever threw shifting gleams and shadows of lines upon his wrinkled brow, till it almost seemed that while he himself was marking out lines and courses on the wrinkled charts, some invisible pencil was also tracing lines and courses upon the deeply marked chart of his forehead.

But it was not this night in particular that, in the solitude of his cabin, Ahab thus pondered over his charts. Almost every night they were brought out; almost every night some pencil marks were effaced, and others were substituted. For with the charts of all four oceans before him, Ahab was threading a maze of currents and eddies, with a view to the more certain accomplishment of that monomaniac thought of his soul.

Now, to any one not fully acquainted with the ways of the leviathans, it might seem an absurdly hopeless task thus to seek out one solitary creature in the unhooped oceans of this planet. But not so did it seem to Ahab, who knew the sets of all tides and currents; and thereby calculating the driftings of the sperm whale’s food; and, also, calling to mind the regular, ascertained seasons for hunting him in particular latitudes; could arrive at reasonable surmises, almost approaching to certainties, concerning the timeliest day to be upon this or that ground in search of his prey.

So assured, indeed, is the fact concerning the periodicalness of the sperm whale’s resorting to given waters, that many hunters believe that, could he be closely observed and studied throughout the world; were the logs for one voyage of the entire whale fleet carefully collated, then the migrations of the sperm whale would be found to correspond in invariability to those of the herring-shoals or the flights of swallows. On this hint, attempts have been made to construct elaborate migratory charts of the sperm whale.*

     *Since the above was written, the statement is happily borne
     out by an official circular, issued by Lieutenant Maury, of
     the National Observatory, Washington, April 16th, 1851. By
     that circular, it appears that precisely such a chart is in
     course of completion; and portions of it are presented in
     the circular. “This chart divides the ocean into districts
     of five degrees of latitude by five degrees of longitude;
     perpendicularly through each of which districts are twelve
     columns for the twelve months; and horizontally through each
     of which districts are three lines; one to show the number
     of days that have been spent in each month in every
     district, and the two others to show the number of days in
     which whales, sperm or right, have been seen.”
 
Besides, when making a passage from one feeding-ground to another, the sperm whales, guided by some infallible instinct—say, rather, secret intelligence from the Deity—mostly swim in veins, as they are called; continuing their way along a given ocean-line with such undeviating exactitude, that no ship ever sailed her course, by any chart, with one tithe of such marvellous precision. Though, in these cases, the direction taken by any one whale be straight as a surveyor’s parallel, and though the line of advance be strictly confined to its own unavoidable, straight wake, yet the arbitrary vein in which at these times he is said to swim, generally embraces some few miles in width (more or less, as the vein is presumed to expand or contract); but never exceeds the visual sweep from the whale-ship’s mast-heads, when circumspectly gliding along this magic zone. The sum is, that at particular seasons within that breadth and along that path, migrating whales may with great confidence be looked for.

And hence not only at substantiated times, upon well known separate feeding-grounds, could Ahab hope to encounter his prey; but in crossing the widest expanses of water between those grounds he could, by his art, so place and time himself on his way, as even then not to be wholly without prospect of a meeting.

There was a circumstance which at first sight seemed to entangle his delirious but still methodical scheme. But not so in the reality, perhaps. Though the gregarious sperm whales have their regular seasons for particular grounds, yet in general you cannot conclude that the herds which haunted such and such a latitude or longitude this year, say, will turn out to be identically the same with those that were found there the preceding season; though there are peculiar and unquestionable instances where the contrary of this has proved true. In general, the same remark, only within a less wide limit, applies to the solitaries and hermits among the matured, aged sperm whales. So that though Moby Dick had in a former year been seen, for example, on what is called the Seychelle ground in the Indian ocean, or Volcano Bay on the Japanese Coast; yet it did not follow, that were the Pequod to visit either of those spots at any subsequent corresponding season, she would infallibly encounter him there. So, too, with some other feeding grounds, where he had at times revealed himself. But all these seemed only his casual stopping-places and ocean-inns, so to speak, not his places of prolonged abode. And where Ahab’s chances of accomplishing his object have hitherto been spoken of, allusion has only been made to whatever way-side, antecedent, extra prospects were his, ere a particular set time or place were attained, when all possibilities would become probabilities, and, as Ahab fondly thought, every possibility the next thing to a certainty. That particular set time and place were conjoined in the one technical phrase—the Season-on-the-Line. For there and then, for several consecutive years, Moby Dick had been periodically descried, lingering in those waters for awhile, as the sun, in its annual round, loiters for a predicted interval in any one sign of the Zodiac. There it was, too, that most of the deadly encounters with the white whale had taken place; there the waves were storied with his deeds; there also was that tragic spot where the monomaniac old man had found the awful motive to his vengeance. But in the cautious comprehensiveness and unloitering vigilance with which Ahab threw his brooding soul into this unfaltering hunt, he would not permit himself to rest all his hopes upon the one crowning fact above mentioned, however flattering it might be to those hopes; nor in the sleeplessness of his vow could he so tranquillize his unquiet heart as to postpone all intervening quest.

Now, the Pequod had sailed from Nantucket at the very beginning of the Season-on-the-Line. No possible endeavor then could enable her commander to make the great passage southwards, double Cape Horn, and then running down sixty degrees of latitude arrive in the equatorial Pacific in time to cruise there. Therefore, he must wait for the next ensuing season. Yet the premature hour of the Pequod’s sailing had, perhaps, been correctly selected by Ahab, with a view to this very complexion of things. Because, an interval of three hundred and sixty-five days and nights was before him; an interval which, instead of impatiently enduring ashore, he would spend in a miscellaneous hunt; if by chance the White Whale, spending his vacation in seas far remote from his periodical feeding-grounds, should turn up his wrinkled brow off the Persian Gulf, or in the Bengal Bay, or China Seas, or in any other waters haunted by his race. So that Monsoons, Pampas, Nor’-Westers, Harmattans, Trades; any wind but the Levanter and Simoon, might blow Moby Dick into the devious zig-zag world-circle of the Pequod’s circumnavigating wake.

But granting all this; yet, regarded discreetly and coolly, seems it not but a mad idea, this; that in the broad boundless ocean, one solitary whale, even if encountered, should be thought capable of individual recognition from his hunter, even as a white-bearded Mufti in the thronged thoroughfares of Constantinople? Yes. For the peculiar snow-white brow of Moby Dick, and his snow-white hump, could not but be unmistakable. And have I not tallied the whale, Ahab would mutter to himself, as after poring over his charts till long after midnight he would throw himself back in reveries—tallied him, and shall he escape? His broad fins are bored, and scalloped out like a lost sheep’s ear! And here, his mad mind would run on in a breathless race; till a weariness and faintness of pondering came over him; and in the open air of the deck he would seek to recover his strength. Ah, God! what trances of torments does that man endure who is consumed with one unachieved revengeful desire. He sleeps with clenched hands; and wakes with his own bloody nails in his palms.

Often, when forced from his hammock by exhausting and intolerably vivid dreams of the night, which, resuming his own intense thoughts through the day, carried them on amid a clashing of phrensies, and whirled them round and round and round in his blazing brain, till the very throbbing of his life-spot became insufferable anguish; and when, as was sometimes the case, these spiritual throes in him heaved his being up from its base, and a chasm seemed opening in him, from which forked flames and lightnings shot up, and accursed fiends beckoned him to leap down among them; when this hell in himself yawned beneath him, a wild cry would be heard through the ship; and with glaring eyes Ahab would burst from his state room, as though escaping from a bed that was on fire. Yet these, perhaps, instead of being the unsuppressable symptoms of some latent weakness, or fright at his own resolve, were but the plainest tokens of its intensity. For, at such times, crazy Ahab, the scheming, unappeasedly steadfast hunter of the white whale; this Ahab that had gone to his hammock, was not the agent that so caused him to burst from it in horror again. The latter was the eternal, living principle or soul in him; and in sleep, being for the time dissociated from the characterizing mind, which at other times employed it for its outer vehicle or agent, it spontaneously sought escape from the scorching contiguity of the frantic thing, of which, for the time, it was no longer an integral. But as the mind does not exist unless leagued with the soul, therefore it must have been that, in Ahab’s case, yielding up all his thoughts and fancies to his one supreme purpose; that purpose, by its own sheer inveteracy of will, forced itself against gods and devils into a kind of self-assumed, independent being of its own. Nay, could grimly live and burn, while the common vitality to which it was conjoined, fled horror-stricken from the unbidden and unfathered birth. Therefore, the tormented spirit that glared out of bodily eyes, when what seemed Ahab rushed from his room, was for the time but a vacated thing, a formless somnambulistic being, a ray of living light, to be sure, but without an object to colour, and therefore a blankness in itself. God help thee, old man, thy thoughts have created a creature in thee; and he whose intense thinking thus makes him a Prometheus; a vulture feeds upon that heart for ever; that vulture the very creature he creates.






CHAPTER 45. The Affidavit.
So far as what there may be of a narrative in this book; and, indeed, as indirectly touching one or two very interesting and curious particulars in the habits of sperm whales, the foregoing chapter, in its earlier part, is as important a one as will be found in this volume; but the leading matter of it requires to be still further and more familiarly enlarged upon, in order to be adequately understood, and moreover to take away any incredulity which a profound ignorance of the entire subject may induce in some minds, as to the natural verity of the main points of this affair.

I care not to perform this part of my task methodically; but shall be content to produce the desired impression by separate citations of items, practically or reliably known to me as a whaleman; and from these citations, I take it—the conclusion aimed at will naturally follow of itself.

First: I have personally known three instances where a whale, after receiving a harpoon, has effected a complete escape; and, after an interval (in one instance of three years), has been again struck by the same hand, and slain; when the two irons, both marked by the same private cypher, have been taken from the body. In the instance where three years intervened between the flinging of the two harpoons; and I think it may have been something more than that; the man who darted them happening, in the interval, to go in a trading ship on a voyage to Africa, went ashore there, joined a discovery party, and penetrated far into the interior, where he travelled for a period of nearly two years, often endangered by serpents, savages, tigers, poisonous miasmas, with all the other common perils incident to wandering in the heart of unknown regions. Meanwhile, the whale he had struck must also have been on its travels; no doubt it had thrice circumnavigated the globe, brushing with its flanks all the coasts of Africa; but to no purpose. This man and this whale again came together, and the one vanquished the other. I say I, myself, have known three instances similar to this; that is in two of them I saw the whales struck; and, upon the second attack, saw the two irons with the respective marks cut in them, afterwards taken from the dead fish. In the three-year instance, it so fell out that I was in the boat both times, first and last, and the last time distinctly recognised a peculiar sort of huge mole under the whale’s eye, which I had observed there three years previous. I say three years, but I am pretty sure it was more than that. Here are three instances, then, which I personally know the truth of; but I have heard of many other instances from persons whose veracity in the matter there is no good ground to impeach.

Secondly: It is well known in the Sperm Whale Fishery, however ignorant the world ashore may be of it, that there have been several memorable historical instances where a particular whale in the ocean has been at distant times and places popularly cognisable. Why such a whale became thus marked was not altogether and originally owing to his bodily peculiarities as distinguished from other whales; for however peculiar in that respect any chance whale may be, they soon put an end to his peculiarities by killing him, and boiling him down into a peculiarly valuable oil. No: the reason was this: that from the fatal experiences of the fishery there hung a terrible prestige of perilousness about such a whale as there did about Rinaldo Rinaldini, insomuch that most fishermen were content to recognise him by merely touching their tarpaulins when he would be discovered lounging by them on the sea, without seeking to cultivate a more intimate acquaintance. Like some poor devils ashore that happen to know an irascible great man, they make distant unobtrusive salutations to him in the street, lest if they pursued the acquaintance further, they might receive a summary thump for their presumption.

But not only did each of these famous whales enjoy great individual celebrity—Nay, you may call it an ocean-wide renown; not only was he famous in life and now is immortal in forecastle stories after death, but he was admitted into all the rights, privileges, and distinctions of a name; had as much a name indeed as Cambyses or Cæsar. Was it not so, O Timor Tom! thou famed leviathan, scarred like an iceberg, who so long did’st lurk in the Oriental straits of that name, whose spout was oft seen from the palmy beach of Ombay? Was it not so, O New Zealand Jack! thou terror of all cruisers that crossed their wakes in the vicinity of the Tattoo Land? Was it not so, O Morquan! King of Japan, whose lofty jet they say at times assumed the semblance of a snow-white cross against the sky? Was it not so, O Don Miguel! thou Chilian whale, marked like an old tortoise with mystic hieroglyphics upon the back! In plain prose, here are four whales as well known to the students of Cetacean History as Marius or Sylla to the classic scholar.

But this is not all. New Zealand Tom and Don Miguel, after at various times creating great havoc among the boats of different vessels, were finally gone in quest of, systematically hunted out, chased and killed by valiant whaling captains, who heaved up their anchors with that express object as much in view, as in setting out through the Narragansett Woods, Captain Butler of old had it in his mind to capture that notorious murderous savage Annawon, the headmost warrior of the Indian King Philip.

I do not know where I can find a better place than just here, to make mention of one or two other things, which to me seem important, as in printed form establishing in all respects the reasonableness of the whole story of the White Whale, more especially the catastrophe. For this is one of those disheartening instances where truth requires full as much bolstering as error. So ignorant are most landsmen of some of the plainest and most palpable wonders of the world, that without some hints touching the plain facts, historical and otherwise, of the fishery, they might scout at Moby Dick as a monstrous fable, or still worse and more detestable, a hideous and intolerable allegory.

First: Though most men have some vague flitting ideas of the general perils of the grand fishery, yet they have nothing like a fixed, vivid conception of those perils, and the frequency with which they recur. One reason perhaps is, that not one in fifty of the actual disasters and deaths by casualties in the fishery, ever finds a public record at home, however transient and immediately forgotten that record. Do you suppose that that poor fellow there, who this moment perhaps caught by the whale-line off the coast of New Guinea, is being carried down to the bottom of the sea by the sounding leviathan—do you suppose that that poor fellow’s name will appear in the newspaper obituary you will read to-morrow at your breakfast? No: because the mails are very irregular between here and New Guinea. In fact, did you ever hear what might be called regular news direct or indirect from New Guinea? Yet I tell you that upon one particular voyage which I made to the Pacific, among many others we spoke thirty different ships, every one of which had had a death by a whale, some of them more than one, and three that had each lost a boat’s crew. For God’s sake, be economical with your lamps and candles! not a gallon you burn, but at least one drop of man’s blood was spilled for it.

Secondly: People ashore have indeed some indefinite idea that a whale is an enormous creature of enormous power; but I have ever found that when narrating to them some specific example of this two-fold enormousness, they have significantly complimented me upon my facetiousness; when, I declare upon my soul, I had no more idea of being facetious than Moses, when he wrote the history of the plagues of Egypt.

But fortunately the special point I here seek can be established upon testimony entirely independent of my own. That point is this: The Sperm Whale is in some cases sufficiently powerful, knowing, and judiciously malicious, as with direct aforethought to stave in, utterly destroy, and sink a large ship; and what is more, the Sperm Whale has done it.

First: In the year 1820 the ship Essex, Captain Pollard, of Nantucket, was cruising in the Pacific Ocean. One day she saw spouts, lowered her boats, and gave chase to a shoal of sperm whales. Ere long, several of the whales were wounded; when, suddenly, a very large whale escaping from the boats, issued from the shoal, and bore directly down upon the ship. Dashing his forehead against her hull, he so stove her in, that in less than “ten minutes” she settled down and fell over. Not a surviving plank of her has been seen since. After the severest exposure, part of the crew reached the land in their boats. Being returned home at last, Captain Pollard once more sailed for the Pacific in command of another ship, but the gods shipwrecked him again upon unknown rocks and breakers; for the second time his ship was utterly lost, and forthwith forswearing the sea, he has never tempted it since. At this day Captain Pollard is a resident of Nantucket. I have seen Owen Chace, who was chief mate of the Essex at the time of the tragedy; I have read his plain and faithful narrative; I have conversed with his son; and all this within a few miles of the scene of the catastrophe.*

*The following are extracts from Chace’s narrative: “Every fact seemed to warrant me in concluding that it was anything but chance which directed his operations; he made two several attacks upon the ship, at a short interval between them, both of which, according to their direction, were calculated to do us the most injury, by being made ahead, and thereby combining the speed of the two objects for the shock; to effect which, the exact manœuvres which he made were necessary. His aspect was most horrible, and such as indicated resentment and fury. He came directly from the shoal which we had just before entered, and in which we had struck three of his companions, as if fired with revenge for their sufferings.” Again: “At all events, the whole circumstances taken together, all happening before my own eyes, and producing, at the time, impressions in my mind of decided, calculating mischief, on the part of the whale (many of which impressions I cannot now recall), induce me to be satisfied that I am correct in my opinion.”

Here are his reflections some time after quitting the ship, during a black night in an open boat, when almost despairing of reaching any hospitable shore. “The dark ocean and swelling waters were nothing; the fears of being swallowed up by some dreadful tempest, or dashed upon hidden rocks, with all the other ordinary subjects of fearful contemplation, seemed scarcely entitled to a moment’s thought; the dismal looking wreck, and the horrid aspect and revenge of the whale, wholly engrossed my reflections, until day again made its appearance.”

In another place—p. 45,—he speaks of “the mysterious and mortal attack of the animal.”

Secondly: The ship Union, also of Nantucket, was in the year 1807 totally lost off the Azores by a similar onset, but the authentic particulars of this catastrophe I have never chanced to encounter, though from the whale hunters I have now and then heard casual allusions to it.

Thirdly: Some eighteen or twenty years ago Commodore J——, then commanding an American sloop-of-war of the first class, happened to be dining with a party of whaling captains, on board a Nantucket ship in the harbor of Oahu, Sandwich Islands. Conversation turning upon whales, the Commodore was pleased to be sceptical touching the amazing strength ascribed to them by the professional gentlemen present. He peremptorily denied for example, that any whale could so smite his stout sloop-of-war as to cause her to leak so much as a thimbleful. Very good; but there is more coming. Some weeks after, the Commodore set sail in this impregnable craft for Valparaiso. But he was stopped on the way by a portly sperm whale, that begged a few moments’ confidential business with him. That business consisted in fetching the Commodore’s craft such a thwack, that with all his pumps going he made straight for the nearest port to heave down and repair. I am not superstitious, but I consider the Commodore’s interview with that whale as providential. Was not Saul of Tarsus converted from unbelief by a similar fright? I tell you, the sperm whale will stand no nonsense.

I will now refer you to Langsdorff’s Voyages for a little circumstance in point, peculiarly interesting to the writer hereof. Langsdorff, you must know by the way, was attached to the Russian Admiral Krusenstern’s famous Discovery Expedition in the beginning of the present century. Captain Langsdorff thus begins his seventeenth chapter:

“By the thirteenth of May our ship was ready to sail, and the next day we were out in the open sea, on our way to Ochotsh. The weather was very clear and fine, but so intolerably cold that we were obliged to keep on our fur clothing. For some days we had very little wind; it was not till the nineteenth that a brisk gale from the northwest sprang up. An uncommon large whale, the body of which was larger than the ship itself, lay almost at the surface of the water, but was not perceived by any one on board till the moment when the ship, which was in full sail, was almost upon him, so that it was impossible to prevent its striking against him. We were thus placed in the most imminent danger, as this gigantic creature, setting up its back, raised the ship three feet at least out of the water. The masts reeled, and the sails fell altogether, while we who were below all sprang instantly upon the deck, concluding that we had struck upon some rock; instead of this we saw the monster sailing off with the utmost gravity and solemnity. Captain D’Wolf applied immediately to the pumps to examine whether or not the vessel had received any damage from the shock, but we found that very happily it had escaped entirely uninjured.”

Now, the Captain D’Wolf here alluded to as commanding the ship in question, is a New Englander, who, after a long life of unusual adventures as a sea-captain, this day resides in the village of Dorchester near Boston. I have the honor of being a nephew of his. I have particularly questioned him concerning this passage in Langsdorff. He substantiates every word. The ship, however, was by no means a large one: a Russian craft built on the Siberian coast, and purchased by my uncle after bartering away the vessel in which he sailed from home.

In that up and down manly book of old-fashioned adventure, so full, too, of honest wonders—the voyage of Lionel Wafer, one of ancient Dampier’s old chums—I found a little matter set down so like that just quoted from Langsdorff, that I cannot forbear inserting it here for a corroborative example, if such be needed.

Lionel, it seems, was on his way to “John Ferdinando,” as he calls the modern Juan Fernandes. “In our way thither,” he says, “about four o’clock in the morning, when we were about one hundred and fifty leagues from the Main of America, our ship felt a terrible shock, which put our men in such consternation that they could hardly tell where they were or what to think; but every one began to prepare for death. And, indeed, the shock was so sudden and violent, that we took it for granted the ship had struck against a rock; but when the amazement was a little over, we cast the lead, and sounded, but found no ground. * * * * * The suddenness of the shock made the guns leap in their carriages, and several of the men were shaken out of their hammocks. Captain Davis, who lay with his head on a gun, was thrown out of his cabin!” Lionel then goes on to impute the shock to an earthquake, and seems to substantiate the imputation by stating that a great earthquake, somewhere about that time, did actually do great mischief along the Spanish land. But I should not much wonder if, in the darkness of that early hour of the morning, the shock was after all caused by an unseen whale vertically bumping the hull from beneath.

I might proceed with several more examples, one way or another known to me, of the great power and malice at times of the sperm whale. In more than one instance, he has been known, not only to chase the assailing boats back to their ships, but to pursue the ship itself, and long withstand all the lances hurled at him from its decks. The English ship Pusie Hall can tell a story on that head; and, as for his strength, let me say, that there have been examples where the lines attached to a running sperm whale have, in a calm, been transferred to the ship, and secured there; the whale towing her great hull through the water, as a horse walks off with a cart. Again, it is very often observed that, if the sperm whale, once struck, is allowed time to rally, he then acts, not so often with blind rage, as with wilful, deliberate designs of destruction to his pursuers; nor is it without conveying some eloquent indication of his character, that upon being attacked he will frequently open his mouth, and retain it in that dread expansion for several consecutive minutes. But I must be content with only one more and a concluding illustration; a remarkable and most significant one, by which you will not fail to see, that not only is the most marvellous event in this book corroborated by plain facts of the present day, but that these marvels (like all marvels) are mere repetitions of the ages; so that for the millionth time we say amen with Solomon—Verily there is nothing new under the sun.

In the sixth Christian century lived Procopius, a Christian magistrate of Constantinople, in the days when Justinian was Emperor and Belisarius general. As many know, he wrote the history of his own times, a work every way of uncommon value. By the best authorities, he has always been considered a most trustworthy and unexaggerating historian, except in some one or two particulars, not at all affecting the matter presently to be mentioned.

Now, in this history of his, Procopius mentions that, during the term of his prefecture at Constantinople, a great sea-monster was captured in the neighboring Propontis, or Sea of Marmora, after having destroyed vessels at intervals in those waters for a period of more than fifty years. A fact thus set down in substantial history cannot easily be gainsaid. Nor is there any reason it should be. Of what precise species this sea-monster was, is not mentioned. But as he destroyed ships, as well as for other reasons, he must have been a whale; and I am strongly inclined to think a sperm whale. And I will tell you why. For a long time I fancied that the sperm whale had been always unknown in the Mediterranean and the deep waters connecting with it. Even now I am certain that those seas are not, and perhaps never can be, in the present constitution of things, a place for his habitual gregarious resort. But further investigations have recently proved to me, that in modern times there have been isolated instances of the presence of the sperm whale in the Mediterranean. I am told, on good authority, that on the Barbary coast, a Commodore Davis of the British navy found the skeleton of a sperm whale. Now, as a vessel of war readily passes through the Dardanelles, hence a sperm whale could, by the same route, pass out of the Mediterranean into the Propontis.

In the Propontis, as far as I can learn, none of that peculiar substance called brit is to be found, the aliment of the right whale. But I have every reason to believe that the food of the sperm whale—squid or cuttle-fish—lurks at the bottom of that sea, because large creatures, but by no means the largest of that sort, have been found at its surface. If, then, you properly put these statements together, and reason upon them a bit, you will clearly perceive that, according to all human reasoning, Procopius’s sea-monster, that for half a century stove the ships of a Roman Emperor, must in all probability have been a sperm whale.






CHAPTER 46. Surmises.
Though, consumed with the hot fire of his purpose, Ahab in all his thoughts and actions ever had in view the ultimate capture of Moby Dick; though he seemed ready to sacrifice all mortal interests to that one passion; nevertheless it may have been that he was by nature and long habituation far too wedded to a fiery whaleman’s ways, altogether to abandon the collateral prosecution of the voyage. Or at least if this were otherwise, there were not wanting other motives much more influential with him. It would be refining too much, perhaps, even considering his monomania, to hint that his vindictiveness towards the White Whale might have possibly extended itself in some degree to all sperm whales, and that the more monsters he slew by so much the more he multiplied the chances that each subsequently encountered whale would prove to be the hated one he hunted. But if such an hypothesis be indeed exceptionable, there were still additional considerations which, though not so strictly according with the wildness of his ruling passion, yet were by no means incapable of swaying him.

To accomplish his object Ahab must use tools; and of all tools used in the shadow of the moon, men are most apt to get out of order. He knew, for example, that however magnetic his ascendency in some respects was over Starbuck, yet that ascendency did not cover the complete spiritual man any more than mere corporeal superiority involves intellectual mastership; for to the purely spiritual, the intellectual but stand in a sort of corporeal relation. Starbuck’s body and Starbuck’s coerced will were Ahab’s, so long as Ahab kept his magnet at Starbuck’s brain; still he knew that for all this the chief mate, in his soul, abhorred his captain’s quest, and could he, would joyfully disintegrate himself from it, or even frustrate it. It might be that a long interval would elapse ere the White Whale was seen. During that long interval Starbuck would ever be apt to fall into open relapses of rebellion against his captain’s leadership, unless some ordinary, prudential, circumstantial influences were brought to bear upon him. Not only that, but the subtle insanity of Ahab respecting Moby Dick was noways more significantly manifested than in his superlative sense and shrewdness in foreseeing that, for the present, the hunt should in some way be stripped of that strange imaginative impiousness which naturally invested it; that the full terror of the voyage must be kept withdrawn into the obscure background (for few men’s courage is proof against protracted meditation unrelieved by action); that when they stood their long night watches, his officers and men must have some nearer things to think of than Moby Dick. For however eagerly and impetuously the savage crew had hailed the announcement of his quest; yet all sailors of all sorts are more or less capricious and unreliable—they live in the varying outer weather, and they inhale its fickleness—and when retained for any object remote and blank in the pursuit, however promissory of life and passion in the end, it is above all things requisite that temporary interests and employments should intervene and hold them healthily suspended for the final dash.

Nor was Ahab unmindful of another thing. In times of strong emotion mankind disdain all base considerations; but such times are evanescent. The permanent constitutional condition of the manufactured man, thought Ahab, is sordidness. Granting that the White Whale fully incites the hearts of this my savage crew, and playing round their savageness even breeds a certain generous knight-errantism in them, still, while for the love of it they give chase to Moby Dick, they must also have food for their more common, daily appetites. For even the high lifted and chivalric Crusaders of old times were not content to traverse two thousand miles of land to fight for their holy sepulchre, without committing burglaries, picking pockets, and gaining other pious perquisites by the way. Had they been strictly held to their one final and romantic object—that final and romantic object, too many would have turned from in disgust. I will not strip these men, thought Ahab, of all hopes of cash—aye, cash. They may scorn cash now; but let some months go by, and no perspective promise of it to them, and then this same quiescent cash all at once mutinying in them, this same cash would soon cashier Ahab.

Nor was there wanting still another precautionary motive more related to Ahab personally. Having impulsively, it is probable, and perhaps somewhat prematurely revealed the prime but private purpose of the Pequod’s voyage, Ahab was now entirely conscious that, in so doing, he had indirectly laid himself open to the unanswerable charge of usurpation; and with perfect impunity, both moral and legal, his crew if so disposed, and to that end competent, could refuse all further obedience to him, and even violently wrest from him the command. From even the barely hinted imputation of usurpation, and the possible consequences of such a suppressed impression gaining ground, Ahab must of course have been most anxious to protect himself. That protection could only consist in his own predominating brain and heart and hand, backed by a heedful, closely calculating attention to every minute atmospheric influence which it was possible for his crew to be subjected to.

For all these reasons then, and others perhaps too analytic to be verbally developed here, Ahab plainly saw that he must still in a good degree continue true to the natural, nominal purpose of the Pequod’s voyage; observe all customary usages; and not only that, but force himself to evince all his well known passionate interest in the general pursuit of his profession.

Be all this as it may, his voice was now often heard hailing the three mast-heads and admonishing them to keep a bright look-out, and not omit reporting even a porpoise. This vigilance was not long without reward.






CHAPTER 47. The Mat-Maker.
It was a cloudy, sultry afternoon; the seamen were lazily lounging about the decks, or vacantly gazing over into the lead-coloured waters. Queequeg and I were mildly employed weaving what is called a sword-mat, for an additional lashing to our boat. So still and subdued and yet somehow preluding was all the scene, and such an incantation of reverie lurked in the air, that each silent sailor seemed resolved into his own invisible self.

I was the attendant or page of Queequeg, while busy at the mat. As I kept passing and repassing the filling or woof of marline between the long yarns of the warp, using my own hand for the shuttle, and as Queequeg, standing sideways, ever and anon slid his heavy oaken sword between the threads, and idly looking off upon the water, carelessly and unthinkingly drove home every yarn: I say so strange a dreaminess did there then reign all over the ship and all over the sea, only broken by the intermitting dull sound of the sword, that it seemed as if this were the Loom of Time, and I myself were a shuttle mechanically weaving and weaving away at the Fates. There lay the fixed threads of the warp subject to but one single, ever returning, unchanging vibration, and that vibration merely enough to admit of the crosswise interblending of other threads with its own. This warp seemed necessity; and here, thought I, with my own hand I ply my own shuttle and weave my own destiny into these unalterable threads. Meantime, Queequeg’s impulsive, indifferent sword, sometimes hitting the woof slantingly, or crookedly, or strongly, or weakly, as the case might be; and by this difference in the concluding blow producing a corresponding contrast in the final aspect of the completed fabric; this savage’s sword, thought I, which thus finally shapes and fashions both warp and woof; this easy, indifferent sword must be chance—aye, chance, free will, and necessity—nowise incompatible—all interweavingly working together. The straight warp of necessity, not to be swerved from its ultimate course—its every alternating vibration, indeed, only tending to that; free will still free to ply her shuttle between given threads; and chance, though restrained in its play within the right lines of necessity, and sideways in its motions directed by free will, though thus prescribed to by both, chance by turns rules either, and has the last featuring blow at events.

Thus we were weaving and weaving away when I started at a sound so strange, long drawn, and musically wild and unearthly, that the ball of free will dropped from my hand, and I stood gazing up at the clouds whence that voice dropped like a wing. High aloft in the cross-trees was that mad Gay-Header, Tashtego. His body was reaching eagerly forward, his hand stretched out like a wand, and at brief sudden intervals he continued his cries. To be sure the same sound was that very moment perhaps being heard all over the seas, from hundreds of whalemen’s look-outs perched as high in the air; but from few of those lungs could that accustomed old cry have derived such a marvellous cadence as from Tashtego the Indian’s.

As he stood hovering over you half suspended in air, so wildly and eagerly peering towards the horizon, you would have thought him some prophet or seer beholding the shadows of Fate, and by those wild cries announcing their coming.

“There she blows! there! there! there! she blows! she blows!”

“Where-away?”

“On the lee-beam, about two miles off! a school of them!”

Instantly all was commotion.

The Sperm Whale blows as a clock ticks, with the same undeviating and reliable uniformity. And thereby whalemen distinguish this fish from other tribes of his genus.

“There go flukes!” was now the cry from Tashtego; and the whales disappeared.

“Quick, steward!” cried Ahab. “Time! time!”

Dough-Boy hurried below, glanced at the watch, and reported the exact minute to Ahab.

The ship was now kept away from the wind, and she went gently rolling before it. Tashtego reporting that the whales had gone down heading to leeward, we confidently looked to see them again directly in advance of our bows. For that singular craft at times evinced by the Sperm Whale when, sounding with his head in one direction, he nevertheless, while concealed beneath the surface, mills round, and swiftly swims off in the opposite quarter—this deceitfulness of his could not now be in action; for there was no reason to suppose that the fish seen by Tashtego had been in any way alarmed, or indeed knew at all of our vicinity. One of the men selected for shipkeepers—that is, those not appointed to the boats, by this time relieved the Indian at the main-mast head. The sailors at the fore and mizzen had come down; the line tubs were fixed in their places; the cranes were thrust out; the mainyard was backed, and the three boats swung over the sea like three samphire baskets over high cliffs. Outside of the bulwarks their eager crews with one hand clung to the rail, while one foot was expectantly poised on the gunwale. So look the long line of man-of-war’s men about to throw themselves on board an enemy’s ship.

But at this critical instant a sudden exclamation was heard that took every eye from the whale. With a start all glared at dark Ahab, who was surrounded by five dusky phantoms that seemed fresh formed out of air.






CHAPTER 48. The First Lowering.
The phantoms, for so they then seemed, were flitting on the other side of the deck, and, with a noiseless celerity, were casting loose the tackles and bands of the boat which swung there. This boat had always been deemed one of the spare boats, though technically called the captain’s, on account of its hanging from the starboard quarter. The figure that now stood by its bows was tall and swart, with one white tooth evilly protruding from its steel-like lips. A rumpled Chinese jacket of black cotton funereally invested him, with wide black trowsers of the same dark stuff. But strangely crowning this ebonness was a glistening white plaited turban, the living hair braided and coiled round and round upon his head. Less swart in aspect, the companions of this figure were of that vivid, tiger-yellow complexion peculiar to some of the aboriginal natives of the Manillas;—a race notorious for a certain diabolism of subtilty, and by some honest white mariners supposed to be the paid spies and secret confidential agents on the water of the devil, their lord, whose counting-room they suppose to be elsewhere.

While yet the wondering ship’s company were gazing upon these strangers, Ahab cried out to the white-turbaned old man at their head, “All ready there, Fedallah?”

“Ready,” was the half-hissed reply.

“Lower away then; d’ye hear?” shouting across the deck. “Lower away there, I say.”

Such was the thunder of his voice, that spite of their amazement the men sprang over the rail; the sheaves whirled round in the blocks; with a wallow, the three boats dropped into the sea; while, with a dexterous, off-handed daring, unknown in any other vocation, the sailors, goat-like, leaped down the rolling ship’s side into the tossed boats below.

Hardly had they pulled out from under the ship’s lee, when a fourth keel, coming from the windward side, pulled round under the stern, and showed the five strangers rowing Ahab, who, standing erect in the stern, loudly hailed Starbuck, Stubb, and Flask, to spread themselves widely, so as to cover a large expanse of water. But with all their eyes again riveted upon the swart Fedallah and his crew, the inmates of the other boats obeyed not the command.

“Captain Ahab?—” said Starbuck.

“Spread yourselves,” cried Ahab; “give way, all four boats. Thou, Flask, pull out more to leeward!”

“Aye, aye, sir,” cheerily cried little King-Post, sweeping round his great steering oar. “Lay back!” addressing his crew. “There!—there!—there again! There she blows right ahead, boys!—lay back!”

“Never heed yonder yellow boys, Archy.”

“Oh, I don’t mind ’em, sir,” said Archy; “I knew it all before now. Didn’t I hear ’em in the hold? And didn’t I tell Cabaco here of it? What say ye, Cabaco? They are stowaways, Mr. Flask.”

“Pull, pull, my fine hearts-alive; pull, my children; pull, my little ones,” drawlingly and soothingly sighed Stubb to his crew, some of whom still showed signs of uneasiness. “Why don’t you break your backbones, my boys? What is it you stare at? Those chaps in yonder boat? Tut! They are only five more hands come to help us—never mind from where—the more the merrier. Pull, then, do pull; never mind the brimstone—devils are good fellows enough. So, so; there you are now; that’s the stroke for a thousand pounds; that’s the stroke to sweep the stakes! Hurrah for the gold cup of sperm oil, my heroes! Three cheers, men—all hearts alive! Easy, easy; don’t be in a hurry—don’t be in a hurry. Why don’t you snap your oars, you rascals? Bite something, you dogs! So, so, so, then:—softly, softly! That’s it—that’s it! long and strong. Give way there, give way! The devil fetch ye, ye ragamuffin rapscallions; ye are all asleep. Stop snoring, ye sleepers, and pull. Pull, will ye? pull, can’t ye? pull, won’t ye? Why in the name of gudgeons and ginger-cakes don’t ye pull?—pull and break something! pull, and start your eyes out! Here!” whipping out the sharp knife from his girdle; “every mother’s son of ye draw his knife, and pull with the blade between his teeth. That’s it—that’s it. Now ye do something; that looks like it, my steel-bits. Start her—start her, my silver-spoons! Start her, marling-spikes!”

Stubb’s exordium to his crew is given here at large, because he had rather a peculiar way of talking to them in general, and especially in inculcating the religion of rowing. But you must not suppose from this specimen of his sermonizings that he ever flew into downright passions with his congregation. Not at all; and therein consisted his chief peculiarity. He would say the most terrific things to his crew, in a tone so strangely compounded of fun and fury, and the fury seemed so calculated merely as a spice to the fun, that no oarsman could hear such queer invocations without pulling for dear life, and yet pulling for the mere joke of the thing. Besides he all the time looked so easy and indolent himself, so loungingly managed his steering-oar, and so broadly gaped—open-mouthed at times—that the mere sight of such a yawning commander, by sheer force of contrast, acted like a charm upon the crew. Then again, Stubb was one of those odd sort of humorists, whose jollity is sometimes so curiously ambiguous, as to put all inferiors on their guard in the matter of obeying them.

In obedience to a sign from Ahab, Starbuck was now pulling obliquely across Stubb’s bow; and when for a minute or so the two boats were pretty near to each other, Stubb hailed the mate.

“Mr. Starbuck! larboard boat there, ahoy! a word with ye, sir, if ye please!”

“Halloa!” returned Starbuck, turning round not a single inch as he spoke; still earnestly but whisperingly urging his crew; his face set like a flint from Stubb’s.

“What think ye of those yellow boys, sir!”

“Smuggled on board, somehow, before the ship sailed. (Strong, strong, boys!)” in a whisper to his crew, then speaking out loud again: “A sad business, Mr. Stubb! (seethe her, seethe her, my lads!) but never mind, Mr. Stubb, all for the best. Let all your crew pull strong, come what will. (Spring, my men, spring!) There’s hogsheads of sperm ahead, Mr. Stubb, and that’s what ye came for. (Pull, my boys!) Sperm, sperm’s the play! This at least is duty; duty and profit hand in hand.”

“Aye, aye, I thought as much,” soliloquized Stubb, when the boats diverged, “as soon as I clapt eye on ’em, I thought so. Aye, and that’s what he went into the after hold for, so often, as Dough-Boy long suspected. They were hidden down there. The White Whale’s at the bottom of it. Well, well, so be it! Can’t be helped! All right! Give way, men! It ain’t the White Whale to-day! Give way!”

Now the advent of these outlandish strangers at such a critical instant as the lowering of the boats from the deck, this had not unreasonably awakened a sort of superstitious amazement in some of the ship’s company; but Archy’s fancied discovery having some time previous got abroad among them, though indeed not credited then, this had in some small measure prepared them for the event. It took off the extreme edge of their wonder; and so what with all this and Stubb’s confident way of accounting for their appearance, they were for the time freed from superstitious surmisings; though the affair still left abundant room for all manner of wild conjectures as to dark Ahab’s precise agency in the matter from the beginning. For me, I silently recalled the mysterious shadows I had seen creeping on board the Pequod during the dim Nantucket dawn, as well as the enigmatical hintings of the unaccountable Elijah.

Meantime, Ahab, out of hearing of his officers, having sided the furthest to windward, was still ranging ahead of the other boats; a circumstance bespeaking how potent a crew was pulling him. Those tiger yellow creatures of his seemed all steel and whalebone; like five trip-hammers they rose and fell with regular strokes of strength, which periodically started the boat along the water like a horizontal burst boiler out of a Mississippi steamer. As for Fedallah, who was seen pulling the harpooneer oar, he had thrown aside his black jacket, and displayed his naked chest with the whole part of his body above the gunwale, clearly cut against the alternating depressions of the watery horizon; while at the other end of the boat Ahab, with one arm, like a fencer’s, thrown half backward into the air, as if to counterbalance any tendency to trip; Ahab was seen steadily managing his steering oar as in a thousand boat lowerings ere the White Whale had torn him. All at once the outstretched arm gave a peculiar motion and then remained fixed, while the boat’s five oars were seen simultaneously peaked. Boat and crew sat motionless on the sea. Instantly the three spread boats in the rear paused on their way. The whales had irregularly settled bodily down into the blue, thus giving no distantly discernible token of the movement, though from his closer vicinity Ahab had observed it.

“Every man look out along his oars!” cried Starbuck. “Thou, Queequeg, stand up!”

Nimbly springing up on the triangular raised box in the bow, the savage stood erect there, and with intensely eager eyes gazed off towards the spot where the chase had last been descried. Likewise upon the extreme stern of the boat where it was also triangularly platformed level with the gunwale, Starbuck himself was seen coolly and adroitly balancing himself to the jerking tossings of his chip of a craft, and silently eyeing the vast blue eye of the sea.

Not very far distant Flask’s boat was also lying breathlessly still; its commander recklessly standing upon the top of the loggerhead, a stout sort of post rooted in the keel, and rising some two feet above the level of the stern platform. It is used for catching turns with the whale line. Its top is not more spacious than the palm of a man’s hand, and standing upon such a base as that, Flask seemed perched at the mast-head of some ship which had sunk to all but her trucks. But little King-Post was small and short, and at the same time little King-Post was full of a large and tall ambition, so that this loggerhead stand-point of his did by no means satisfy King-Post.

“I can’t see three seas off; tip us up an oar there, and let me on to that.”

Upon this, Daggoo, with either hand upon the gunwale to steady his way, swiftly slid aft, and then erecting himself volunteered his lofty shoulders for a pedestal.

“Good a mast-head as any, sir. Will you mount?”

“That I will, and thank ye very much, my fine fellow; only I wish you fifty feet taller.”

Whereupon planting his feet firmly against two opposite planks of the boat, the gigantic negro, stooping a little, presented his flat palm to Flask’s foot, and then putting Flask’s hand on his hearse-plumed head and bidding him spring as he himself should toss, with one dexterous fling landed the little man high and dry on his shoulders. And here was Flask now standing, Daggoo with one lifted arm furnishing him with a breastband to lean against and steady himself by.

At any time it is a strange sight to the tyro to see with what wondrous habitude of unconscious skill the whaleman will maintain an erect posture in his boat, even when pitched about by the most riotously perverse and cross-running seas. Still more strange to see him giddily perched upon the loggerhead itself, under such circumstances. But the sight of little Flask mounted upon gigantic Daggoo was yet more curious; for sustaining himself with a cool, indifferent, easy, unthought of, barbaric majesty, the noble negro to every roll of the sea harmoniously rolled his fine form. On his broad back, flaxen-haired Flask seemed a snow-flake. The bearer looked nobler than the rider. Though truly vivacious, tumultuous, ostentatious little Flask would now and then stamp with impatience; but not one added heave did he thereby give to the negro’s lordly chest. So have I seen Passion and Vanity stamping the living magnanimous earth, but the earth did not alter her tides and her seasons for that.

Meanwhile Stubb, the third mate, betrayed no such far-gazing solicitudes. The whales might have made one of their regular soundings, not a temporary dive from mere fright; and if that were the case, Stubb, as his wont in such cases, it seems, was resolved to solace the languishing interval with his pipe. He withdrew it from his hatband, where he always wore it aslant like a feather. He loaded it, and rammed home the loading with his thumb-end; but hardly had he ignited his match across the rough sandpaper of his hand, when Tashtego, his harpooneer, whose eyes had been setting to windward like two fixed stars, suddenly dropped like light from his erect attitude to his seat, crying out in a quick phrensy of hurry, “Down, down all, and give way!—there they are!”

To a landsman, no whale, nor any sign of a herring, would have been visible at that moment; nothing but a troubled bit of greenish white water, and thin scattered puffs of vapor hovering over it, and suffusingly blowing off to leeward, like the confused scud from white rolling billows. The air around suddenly vibrated and tingled, as it were, like the air over intensely heated plates of iron. Beneath this atmospheric waving and curling, and partially beneath a thin layer of water, also, the whales were swimming. Seen in advance of all the other indications, the puffs of vapor they spouted, seemed their forerunning couriers and detached flying outriders.

All four boats were now in keen pursuit of that one spot of troubled water and air. But it bade fair to outstrip them; it flew on and on, as a mass of interblending bubbles borne down a rapid stream from the hills.

“Pull, pull, my good boys,” said Starbuck, in the lowest possible but intensest concentrated whisper to his men; while the sharp fixed glance from his eyes darted straight ahead of the bow, almost seemed as two visible needles in two unerring binnacle compasses. He did not say much to his crew, though, nor did his crew say anything to him. Only the silence of the boat was at intervals startlingly pierced by one of his peculiar whispers, now harsh with command, now soft with entreaty.

How different the loud little King-Post. “Sing out and say something, my hearties. Roar and pull, my thunderbolts! Beach me, beach me on their black backs, boys; only do that for me, and I’ll sign over to you my Martha’s Vineyard plantation, boys; including wife and children, boys. Lay me on—lay me on! O Lord, Lord! but I shall go stark, staring mad! See! see that white water!” And so shouting, he pulled his hat from his head, and stamped up and down on it; then picking it up, flirted it far off upon the sea; and finally fell to rearing and plunging in the boat’s stern like a crazed colt from the prairie.

“Look at that chap now,” philosophically drawled Stubb, who, with his unlighted short pipe, mechanically retained between his teeth, at a short distance, followed after—“He’s got fits, that Flask has. Fits? yes, give him fits—that’s the very word—pitch fits into ’em. Merrily, merrily, hearts-alive. Pudding for supper, you know;—merry’s the word. Pull, babes—pull, sucklings—pull, all. But what the devil are you hurrying about? Softly, softly, and steadily, my men. Only pull, and keep pulling; nothing more. Crack all your backbones, and bite your knives in two—that’s all. Take it easy—why don’t ye take it easy, I say, and burst all your livers and lungs!”

But what it was that inscrutable Ahab said to that tiger-yellow crew of his—these were words best omitted here; for you live under the blessed light of the evangelical land. Only the infidel sharks in the audacious seas may give ear to such words, when, with tornado brow, and eyes of red murder, and foam-glued lips, Ahab leaped after his prey.

Meanwhile, all the boats tore on. The repeated specific allusions of Flask to “that whale,” as he called the fictitious monster which he declared to be incessantly tantalizing his boat’s bow with its tail—these allusions of his were at times so vivid and life-like, that they would cause some one or two of his men to snatch a fearful look over the shoulder. But this was against all rule; for the oarsmen must put out their eyes, and ram a skewer through their necks; usage pronouncing that they must have no organs but ears, and no limbs but arms, in these critical moments.

It was a sight full of quick wonder and awe! The vast swells of the omnipotent sea; the surging, hollow roar they made, as they rolled along the eight gunwales, like gigantic bowls in a boundless bowling-green; the brief suspended agony of the boat, as it would tip for an instant on the knife-like edge of the sharper waves, that almost seemed threatening to cut it in two; the sudden profound dip into the watery glens and hollows; the keen spurrings and goadings to gain the top of the opposite hill; the headlong, sled-like slide down its other side;—all these, with the cries of the headsmen and harpooneers, and the shuddering gasps of the oarsmen, with the wondrous sight of the ivory Pequod bearing down upon her boats with outstretched sails, like a wild hen after her screaming brood;—all this was thrilling.

Not the raw recruit, marching from the bosom of his wife into the fever heat of his first battle; not the dead man’s ghost encountering the first unknown phantom in the other world;—neither of these can feel stranger and stronger emotions than that man does, who for the first time finds himself pulling into the charmed, churned circle of the hunted sperm whale.

The dancing white water made by the chase was now becoming more and more visible, owing to the increasing darkness of the dun cloud-shadows flung upon the sea. The jets of vapor no longer blended, but tilted everywhere to right and left; the whales seemed separating their wakes. The boats were pulled more apart; Starbuck giving chase to three whales running dead to leeward. Our sail was now set, and, with the still rising wind, we rushed along; the boat going with such madness through the water, that the lee oars could scarcely be worked rapidly enough to escape being torn from the row-locks.

Soon we were running through a suffusing wide veil of mist; neither ship nor boat to be seen.

“Give way, men,” whispered Starbuck, drawing still further aft the sheet of his sail; “there is time to kill a fish yet before the squall comes. There’s white water again!—close to! Spring!”

Soon after, two cries in quick succession on each side of us denoted that the other boats had got fast; but hardly were they overheard, when with a lightning-like hurtling whisper Starbuck said: “Stand up!” and Queequeg, harpoon in hand, sprang to his feet.

Though not one of the oarsmen was then facing the life and death peril so close to them ahead, yet with their eyes on the intense countenance of the mate in the stern of the boat, they knew that the imminent instant had come; they heard, too, an enormous wallowing sound as of fifty elephants stirring in their litter. Meanwhile the boat was still booming through the mist, the waves curling and hissing around us like the erected crests of enraged serpents.

“That’s his hump. There, there, give it to him!” whispered Starbuck.

A short rushing sound leaped out of the boat; it was the darted iron of Queequeg. Then all in one welded commotion came an invisible push from astern, while forward the boat seemed striking on a ledge; the sail collapsed and exploded; a gush of scalding vapor shot up near by; something rolled and tumbled like an earthquake beneath us. The whole crew were half suffocated as they were tossed helter-skelter into the white curdling cream of the squall. Squall, whale, and harpoon had all blended together; and the whale, merely grazed by the iron, escaped.

Though completely swamped, the boat was nearly unharmed. Swimming round it we picked up the floating oars, and lashing them across the gunwale, tumbled back to our places. There we sat up to our knees in the sea, the water covering every rib and plank, so that to our downward gazing eyes the suspended craft seemed a coral boat grown up to us from the bottom of the ocean.

The wind increased to a howl; the waves dashed their bucklers together; the whole squall roared, forked, and crackled around us like a white fire upon the prairie, in which, unconsumed, we were burning; immortal in these jaws of death! In vain we hailed the other boats; as well roar to the live coals down the chimney of a flaming furnace as hail those boats in that storm. Meanwhile the driving scud, rack, and mist, grew darker with the shadows of night; no sign of the ship could be seen. The rising sea forbade all attempts to bale out the boat. The oars were useless as propellers, performing now the office of life-preservers. So, cutting the lashing of the waterproof match keg, after many failures Starbuck contrived to ignite the lamp in the lantern; then stretching it on a waif pole, handed it to Queequeg as the standard-bearer of this forlorn hope. There, then, he sat, holding up that imbecile candle in the heart of that almighty forlornness. There, then, he sat, the sign and symbol of a man without faith, hopelessly holding up hope in the midst of despair.

Wet, drenched through, and shivering cold, despairing of ship or boat, we lifted up our eyes as the dawn came on. The mist still spread over the sea, the empty lantern lay crushed in the bottom of the boat. Suddenly Queequeg started to his feet, hollowing his hand to his ear. We all heard a faint creaking, as of ropes and yards hitherto muffled by the storm. The sound came nearer and nearer; the thick mists were dimly parted by a huge, vague form. Affrighted, we all sprang into the sea as the ship at last loomed into view, bearing right down upon us within a distance of not much more than its length.

Floating on the waves we saw the abandoned boat, as for one instant it tossed and gaped beneath the ship’s bows like a chip at the base of a cataract; and then the vast hull rolled over it, and it was seen no more till it came up weltering astern. Again we swam for it, were dashed against it by the seas, and were at last taken up and safely landed on board. Ere the squall came close to, the other boats had cut loose from their fish and returned to the ship in good time. The ship had given us up, but was still cruising, if haply it might light upon some token of our perishing,—an oar or a lance pole.






CHAPTER 49. The Hyena.
There are certain queer times and occasions in this strange mixed affair we call life when a man takes this whole universe for a vast practical joke, though the wit thereof he but dimly discerns, and more than suspects that the joke is at nobody’s expense but his own. However, nothing dispirits, and nothing seems worth while disputing. He bolts down all events, all creeds, and beliefs, and persuasions, all hard things visible and invisible, never mind how knobby; as an ostrich of potent digestion gobbles down bullets and gun flints. And as for small difficulties and worryings, prospects of sudden disaster, peril of life and limb; all these, and death itself, seem to him only sly, good-natured hits, and jolly punches in the side bestowed by the unseen and unaccountable old joker. That odd sort of wayward mood I am speaking of, comes over a man only in some time of extreme tribulation; it comes in the very midst of his earnestness, so that what just before might have seemed to him a thing most momentous, now seems but a part of the general joke. There is nothing like the perils of whaling to breed this free and easy sort of genial, desperado philosophy; and with it I now regarded this whole voyage of the Pequod, and the great White Whale its object.

“Queequeg,” said I, when they had dragged me, the last man, to the deck, and I was still shaking myself in my jacket to fling off the water; “Queequeg, my fine friend, does this sort of thing often happen?” Without much emotion, though soaked through just like me, he gave me to understand that such things did often happen.

“Mr. Stubb,” said I, turning to that worthy, who, buttoned up in his oil-jacket, was now calmly smoking his pipe in the rain; “Mr. Stubb, I think I have heard you say that of all whalemen you ever met, our chief mate, Mr. Starbuck, is by far the most careful and prudent. I suppose then, that going plump on a flying whale with your sail set in a foggy squall is the height of a whaleman’s discretion?”

“Certain. I’ve lowered for whales from a leaking ship in a gale off Cape Horn.”

“Mr. Flask,” said I, turning to little King-Post, who was standing close by; “you are experienced in these things, and I am not. Will you tell me whether it is an unalterable law in this fishery, Mr. Flask, for an oarsman to break his own back pulling himself back-foremost into death’s jaws?”

“Can’t you twist that smaller?” said Flask. “Yes, that’s the law. I should like to see a boat’s crew backing water up to a whale face foremost. Ha, ha! the whale would give them squint for squint, mind that!”

Here then, from three impartial witnesses, I had a deliberate statement of the entire case. Considering, therefore, that squalls and capsizings in the water and consequent bivouacks on the deep, were matters of common occurrence in this kind of life; considering that at the superlatively critical instant of going on to the whale I must resign my life into the hands of him who steered the boat—oftentimes a fellow who at that very moment is in his impetuousness upon the point of scuttling the craft with his own frantic stampings; considering that the particular disaster to our own particular boat was chiefly to be imputed to Starbuck’s driving on to his whale almost in the teeth of a squall, and considering that Starbuck, notwithstanding, was famous for his great heedfulness in the fishery; considering that I belonged to this uncommonly prudent Starbuck’s boat; and finally considering in what a devil’s chase I was implicated, touching the White Whale: taking all things together, I say, I thought I might as well go below and make a rough draft of my will. “Queequeg,” said I, “come along, you shall be my lawyer, executor, and legatee.”

It may seem strange that of all men sailors should be tinkering at their last wills and testaments, but there are no people in the world more fond of that diversion. This was the fourth time in my nautical life that I had done the same thing. After the ceremony was concluded upon the present occasion, I felt all the easier; a stone was rolled away from my heart. Besides, all the days I should now live would be as good as the days that Lazarus lived after his resurrection; a supplementary clean gain of so many months or weeks as the case might be. I survived myself; my death and burial were locked up in my chest. I looked round me tranquilly and contentedly, like a quiet ghost with a clean conscience sitting inside the bars of a snug family vault.

Now then, thought I, unconsciously rolling up the sleeves of my frock, here goes for a cool, collected dive at death and destruction, and the devil fetch the hindmost.






CHAPTER 50. Ahab’s Boat and Crew. Fedallah.
“Who would have thought it, Flask!” cried Stubb; “if I had but one leg you would not catch me in a boat, unless maybe to stop the plug-hole with my timber toe. Oh! he’s a wonderful old man!”

“I don’t think it so strange, after all, on that account,” said Flask. “If his leg were off at the hip, now, it would be a different thing. That would disable him; but he has one knee, and good part of the other left, you know.”

“I don’t know that, my little man; I never yet saw him kneel.”

Among whale-wise people it has often been argued whether, considering the paramount importance of his life to the success of the voyage, it is right for a whaling captain to jeopardize that life in the active perils of the chase. So Tamerlane’s soldiers often argued with tears in their eyes, whether that invaluable life of his ought to be carried into the thickest of the fight.

But with Ahab the question assumed a modified aspect. Considering that with two legs man is but a hobbling wight in all times of danger; considering that the pursuit of whales is always under great and extraordinary difficulties; that every individual moment, indeed, then comprises a peril; under these circumstances is it wise for any maimed man to enter a whale-boat in the hunt? As a general thing, the joint-owners of the Pequod must have plainly thought not.

Ahab well knew that although his friends at home would think little of his entering a boat in certain comparatively harmless vicissitudes of the chase, for the sake of being near the scene of action and giving his orders in person, yet for Captain Ahab to have a boat actually apportioned to him as a regular headsman in the hunt—above all for Captain Ahab to be supplied with five extra men, as that same boat’s crew, he well knew that such generous conceits never entered the heads of the owners of the Pequod. Therefore he had not solicited a boat’s crew from them, nor had he in any way hinted his desires on that head. Nevertheless he had taken private measures of his own touching all that matter. Until Cabaco’s published discovery, the sailors had little foreseen it, though to be sure when, after being a little while out of port, all hands had concluded the customary business of fitting the whaleboats for service; when some time after this Ahab was now and then found bestirring himself in the matter of making thole-pins with his own hands for what was thought to be one of the spare boats, and even solicitously cutting the small wooden skewers, which when the line is running out are pinned over the groove in the bow: when all this was observed in him, and particularly his solicitude in having an extra coat of sheathing in the bottom of the boat, as if to make it better withstand the pointed pressure of his ivory limb; and also the anxiety he evinced in exactly shaping the thigh board, or clumsy cleat, as it is sometimes called, the horizontal piece in the boat’s bow for bracing the knee against in darting or stabbing at the whale; when it was observed how often he stood up in that boat with his solitary knee fixed in the semi-circular depression in the cleat, and with the carpenter’s chisel gouged out a little here and straightened it a little there; all these things, I say, had awakened much interest and curiosity at the time. But almost everybody supposed that this particular preparative heedfulness in Ahab must only be with a view to the ultimate chase of Moby Dick; for he had already revealed his intention to hunt that mortal monster in person. But such a supposition did by no means involve the remotest suspicion as to any boat’s crew being assigned to that boat.

Now, with the subordinate phantoms, what wonder remained soon waned away; for in a whaler wonders soon wane. Besides, now and then such unaccountable odds and ends of strange nations come up from the unknown nooks and ash-holes of the earth to man these floating outlaws of whalers; and the ships themselves often pick up such queer castaway creatures found tossing about the open sea on planks, bits of wreck, oars, whaleboats, canoes, blown-off Japanese junks, and what not; that Beelzebub himself might climb up the side and step down into the cabin to chat with the captain, and it would not create any unsubduable excitement in the forecastle.

But be all this as it may, certain it is that while the subordinate phantoms soon found their place among the crew, though still as it were somehow distinct from them, yet that hair-turbaned Fedallah remained a muffled mystery to the last. Whence he came in a mannerly world like this, by what sort of unaccountable tie he soon evinced himself to be linked with Ahab’s peculiar fortunes; nay, so far as to have some sort of a half-hinted influence; Heaven knows, but it might have been even authority over him; all this none knew. But one cannot sustain an indifferent air concerning Fedallah. He was such a creature as civilized, domestic people in the temperate zone only see in their dreams, and that but dimly; but the like of whom now and then glide among the unchanging Asiatic communities, especially the Oriental isles to the east of the continent—those insulated, immemorial, unalterable countries, which even in these modern days still preserve much of the ghostly aboriginalness of earth’s primal generations, when the memory of the first man was a distinct recollection, and all men his descendants, unknowing whence he came, eyed each other as real phantoms, and asked of the sun and the moon why they were created and to what end; when though, according to Genesis, the angels indeed consorted with the daughters of men, the devils also, add the uncanonical Rabbins, indulged in mundane amours.






CHAPTER 51. The Spirit-Spout.
Days, weeks passed, and under easy sail, the ivory Pequod had slowly swept across four several cruising-grounds; that off the Azores; off the Cape de Verdes; on the Plate (so called), being off the mouth of the Rio de la Plata; and the Carrol Ground, an unstaked, watery locality, southerly from St. Helena.

It was while gliding through these latter waters that one serene and moonlight night, when all the waves rolled by like scrolls of silver; and, by their soft, suffusing seethings, made what seemed a silvery silence, not a solitude; on such a silent night a silvery jet was seen far in advance of the white bubbles at the bow. Lit up by the moon, it looked celestial; seemed some plumed and glittering god uprising from the sea. Fedallah first descried this jet. For of these moonlight nights, it was his wont to mount to the main-mast head, and stand a look-out there, with the same precision as if it had been day. And yet, though herds of whales were seen by night, not one whaleman in a hundred would venture a lowering for them. You may think with what emotions, then, the seamen beheld this old Oriental perched aloft at such unusual hours; his turban and the moon, companions in one sky. But when, after spending his uniform interval there for several successive nights without uttering a single sound; when, after all this silence, his unearthly voice was heard announcing that silvery, moon-lit jet, every reclining mariner started to his feet as if some winged spirit had lighted in the rigging, and hailed the mortal crew. “There she blows!” Had the trump of judgment blown, they could not have quivered more; yet still they felt no terror; rather pleasure. For though it was a most unwonted hour, yet so impressive was the cry, and so deliriously exciting, that almost every soul on board instinctively desired a lowering.

Walking the deck with quick, side-lunging strides, Ahab commanded the t’gallant sails and royals to be set, and every stunsail spread. The best man in the ship must take the helm. Then, with every mast-head manned, the piled-up craft rolled down before the wind. The strange, upheaving, lifting tendency of the taffrail breeze filling the hollows of so many sails, made the buoyant, hovering deck to feel like air beneath the feet; while still she rushed along, as if two antagonistic influences were struggling in her—one to mount direct to heaven, the other to drive yawingly to some horizontal goal. And had you watched Ahab’s face that night, you would have thought that in him also two different things were warring. While his one live leg made lively echoes along the deck, every stroke of his dead limb sounded like a coffin-tap. On life and death this old man walked. But though the ship so swiftly sped, and though from every eye, like arrows, the eager glances shot, yet the silvery jet was no more seen that night. Every sailor swore he saw it once, but not a second time.

This midnight-spout had almost grown a forgotten thing, when, some days after, lo! at the same silent hour, it was again announced: again it was descried by all; but upon making sail to overtake it, once more it disappeared as if it had never been. And so it served us night after night, till no one heeded it but to wonder at it. Mysteriously jetted into the clear moonlight, or starlight, as the case might be; disappearing again for one whole day, or two days, or three; and somehow seeming at every distinct repetition to be advancing still further and further in our van, this solitary jet seemed for ever alluring us on.

Nor with the immemorial superstition of their race, and in accordance with the preternaturalness, as it seemed, which in many things invested the Pequod, were there wanting some of the seamen who swore that whenever and wherever descried; at however remote times, or in however far apart latitudes and longitudes, that unnearable spout was cast by one self-same whale; and that whale, Moby Dick. For a time, there reigned, too, a sense of peculiar dread at this flitting apparition, as if it were treacherously beckoning us on and on, in order that the monster might turn round upon us, and rend us at last in the remotest and most savage seas.

These temporary apprehensions, so vague but so awful, derived a wondrous potency from the contrasting serenity of the weather, in which, beneath all its blue blandness, some thought there lurked a devilish charm, as for days and days we voyaged along, through seas so wearily, lonesomely mild, that all space, in repugnance to our vengeful errand, seemed vacating itself of life before our urn-like prow.

But, at last, when turning to the eastward, the Cape winds began howling around us, and we rose and fell upon the long, troubled seas that are there; when the ivory-tusked Pequod sharply bowed to the blast, and gored the dark waves in her madness, till, like showers of silver chips, the foam-flakes flew over her bulwarks; then all this desolate vacuity of life went away, but gave place to sights more dismal than before.

Close to our bows, strange forms in the water darted hither and thither before us; while thick in our rear flew the inscrutable sea-ravens. And every morning, perched on our stays, rows of these birds were seen; and spite of our hootings, for a long time obstinately clung to the hemp, as though they deemed our ship some drifting, uninhabited craft; a thing appointed to desolation, and therefore fit roosting-place for their homeless selves. And heaved and heaved, still unrestingly heaved the black sea, as if its vast tides were a conscience; and the great mundane soul were in anguish and remorse for the long sin and suffering it had bred.

Cape of Good Hope, do they call ye? Rather Cape Tormentoso, as called of yore; for long allured by the perfidious silences that before had attended us, we found ourselves launched into this tormented sea, where guilty beings transformed into those fowls and these fish, seemed condemned to swim on everlastingly without any haven in store, or beat that black air without any horizon. But calm, snow-white, and unvarying; still directing its fountain of feathers to the sky; still beckoning us on from before, the solitary jet would at times be descried.

During all this blackness of the elements, Ahab, though assuming for the time the almost continual command of the drenched and dangerous deck, manifested the gloomiest reserve; and more seldom than ever addressed his mates. In tempestuous times like these, after everything above and aloft has been secured, nothing more can be done but passively to await the issue of the gale. Then Captain and crew become practical fatalists. So, with his ivory leg inserted into its accustomed hole, and with one hand firmly grasping a shroud, Ahab for hours and hours would stand gazing dead to windward, while an occasional squall of sleet or snow would all but congeal his very eyelashes together. Meantime, the crew driven from the forward part of the ship by the perilous seas that burstingly broke over its bows, stood in a line along the bulwarks in the waist; and the better to guard against the leaping waves, each man had slipped himself into a sort of bowline secured to the rail, in which he swung as in a loosened belt. Few or no words were spoken; and the silent ship, as if manned by painted sailors in wax, day after day tore on through all the swift madness and gladness of the demoniac waves. By night the same muteness of humanity before the shrieks of the ocean prevailed; still in silence the men swung in the bowlines; still wordless Ahab stood up to the blast. Even when wearied nature seemed demanding repose he would not seek that repose in his hammock. Never could Starbuck forget the old man’s aspect, when one night going down into the cabin to mark how the barometer stood, he saw him with closed eyes sitting straight in his floor-screwed chair; the rain and half-melted sleet of the storm from which he had some time before emerged, still slowly dripping from the unremoved hat and coat. On the table beside him lay unrolled one of those charts of tides and currents which have previously been spoken of. His lantern swung from his tightly clenched hand. Though the body was erect, the head was thrown back so that the closed eyes were pointed towards the needle of the tell-tale that swung from a beam in the ceiling.*

*The cabin-compass is called the tell-tale, because without going to the compass at the helm, the Captain, while below, can inform himself of the course of the ship.

Terrible old man! thought Starbuck with a shudder, sleeping in this gale, still thou steadfastly eyest thy purpose.






CHAPTER 52. The Albatross.
South-eastward from the Cape, off the distant Crozetts, a good cruising ground for Right Whalemen, a sail loomed ahead, the Goney (Albatross) by name. As she slowly drew nigh, from my lofty perch at the fore-mast-head, I had a good view of that sight so remarkable to a tyro in the far ocean fisheries—a whaler at sea, and long absent from home.

As if the waves had been fullers, this craft was bleached like the skeleton of a stranded walrus. All down her sides, this spectral appearance was traced with long channels of reddened rust, while all her spars and her rigging were like the thick branches of trees furred over with hoar-frost. Only her lower sails were set. A wild sight it was to see her long-bearded look-outs at those three mast-heads. They seemed clad in the skins of beasts, so torn and bepatched the raiment that had survived nearly four years of cruising. Standing in iron hoops nailed to the mast, they swayed and swung over a fathomless sea; and though, when the ship slowly glided close under our stern, we six men in the air came so nigh to each other that we might almost have leaped from the mast-heads of one ship to those of the other; yet, those forlorn-looking fishermen, mildly eyeing us as they passed, said not one word to our own look-outs, while the quarter-deck hail was being heard from below.

“Ship ahoy! Have ye seen the White Whale?”

But as the strange captain, leaning over the pallid bulwarks, was in the act of putting his trumpet to his mouth, it somehow fell from his hand into the sea; and the wind now rising amain, he in vain strove to make himself heard without it. Meantime his ship was still increasing the distance between. While in various silent ways the seamen of the Pequod were evincing their observance of this ominous incident at the first mere mention of the White Whale’s name to another ship, Ahab for a moment paused; it almost seemed as though he would have lowered a boat to board the stranger, had not the threatening wind forbade. But taking advantage of his windward position, he again seized his trumpet, and knowing by her aspect that the stranger vessel was a Nantucketer and shortly bound home, he loudly hailed—“Ahoy there! This is the Pequod, bound round the world! Tell them to address all future letters to the Pacific ocean! and this time three years, if I am not at home, tell them to address them to ——”

At that moment the two wakes were fairly crossed, and instantly, then, in accordance with their singular ways, shoals of small harmless fish, that for some days before had been placidly swimming by our side, darted away with what seemed shuddering fins, and ranged themselves fore and aft with the stranger’s flanks. Though in the course of his continual voyagings Ahab must often before have noticed a similar sight, yet, to any monomaniac man, the veriest trifles capriciously carry meanings.

“Swim away from me, do ye?” murmured Ahab, gazing over into the water. There seemed but little in the words, but the tone conveyed more of deep helpless sadness than the insane old man had ever before evinced. But turning to the steersman, who thus far had been holding the ship in the wind to diminish her headway, he cried out in his old lion voice,—“Up helm! Keep her off round the world!”

Round the world! There is much in that sound to inspire proud feelings; but whereto does all that circumnavigation conduct? Only through numberless perils to the very point whence we started, where those that we left behind secure, were all the time before us.

Were this world an endless plain, and by sailing eastward we could for ever reach new distances, and discover sights more sweet and strange than any Cyclades or Islands of King Solomon, then there were promise in the voyage. But in pursuit of those far mysteries we dream of, or in tormented chase of that demon phantom that, some time or other, swims before all human hearts; while chasing such over this round globe, they either lead us on in barren mazes or midway leave us whelmed.






CHAPTER 53. The Gam.
The ostensible reason why Ahab did not go on board of the whaler we had spoken was this: the wind and sea betokened storms. But even had this not been the case, he would not after all, perhaps, have boarded her—judging by his subsequent conduct on similar occasions—if so it had been that, by the process of hailing, he had obtained a negative answer to the question he put. For, as it eventually turned out, he cared not to consort, even for five minutes, with any stranger captain, except he could contribute some of that information he so absorbingly sought. But all this might remain inadequately estimated, were not something said here of the peculiar usages of whaling-vessels when meeting each other in foreign seas, and especially on a common cruising-ground.

If two strangers crossing the Pine Barrens in New York State, or the equally desolate Salisbury Plain in England; if casually encountering each other in such inhospitable wilds, these twain, for the life of them, cannot well avoid a mutual salutation; and stopping for a moment to interchange the news; and, perhaps, sitting down for a while and resting in concert: then, how much more natural that upon the illimitable Pine Barrens and Salisbury Plains of the sea, two whaling vessels descrying each other at the ends of the earth—off lone Fanning’s Island, or the far away King’s Mills; how much more natural, I say, that under such circumstances these ships should not only interchange hails, but come into still closer, more friendly and sociable contact. And especially would this seem to be a matter of course, in the case of vessels owned in one seaport, and whose captains, officers, and not a few of the men are personally known to each other; and consequently, have all sorts of dear domestic things to talk about.

For the long absent ship, the outward-bounder, perhaps, has letters on board; at any rate, she will be sure to let her have some papers of a date a year or two later than the last one on her blurred and thumb-worn files. And in return for that courtesy, the outward-bound ship would receive the latest whaling intelligence from the cruising-ground to which she may be destined, a thing of the utmost importance to her. And in degree, all this will hold true concerning whaling vessels crossing each other’s track on the cruising-ground itself, even though they are equally long absent from home. For one of them may have received a transfer of letters from some third, and now far remote vessel; and some of those letters may be for the people of the ship she now meets. Besides, they would exchange the whaling news, and have an agreeable chat. For not only would they meet with all the sympathies of sailors, but likewise with all the peculiar congenialities arising from a common pursuit and mutually shared privations and perils.

Nor would difference of country make any very essential difference; that is, so long as both parties speak one language, as is the case with Americans and English. Though, to be sure, from the small number of English whalers, such meetings do not very often occur, and when they do occur there is too apt to be a sort of shyness between them; for your Englishman is rather reserved, and your Yankee, he does not fancy that sort of thing in anybody but himself. Besides, the English whalers sometimes affect a kind of metropolitan superiority over the American whalers; regarding the long, lean Nantucketer, with his nondescript provincialisms, as a sort of sea-peasant. But where this superiority in the English whalemen does really consist, it would be hard to say, seeing that the Yankees in one day, collectively, kill more whales than all the English, collectively, in ten years. But this is a harmless little foible in the English whale-hunters, which the Nantucketer does not take much to heart; probably, because he knows that he has a few foibles himself.

So, then, we see that of all ships separately sailing the sea, the whalers have most reason to be sociable—and they are so. Whereas, some merchant ships crossing each other’s wake in the mid-Atlantic, will oftentimes pass on without so much as a single word of recognition, mutually cutting each other on the high seas, like a brace of dandies in Broadway; and all the time indulging, perhaps, in finical criticism upon each other’s rig. As for Men-of-War, when they chance to meet at sea, they first go through such a string of silly bowings and scrapings, such a ducking of ensigns, that there does not seem to be much right-down hearty good-will and brotherly love about it at all. As touching Slave-ships meeting, why, they are in such a prodigious hurry, they run away from each other as soon as possible. And as for Pirates, when they chance to cross each other’s cross-bones, the first hail is—“How many skulls?”—the same way that whalers hail—“How many barrels?” And that question once answered, pirates straightway steer apart, for they are infernal villains on both sides, and don’t like to see overmuch of each other’s villanous likenesses.

But look at the godly, honest, unostentatious, hospitable, sociable, free-and-easy whaler! What does the whaler do when she meets another whaler in any sort of decent weather? She has a “Gam,” a thing so utterly unknown to all other ships that they never heard of the name even; and if by chance they should hear of it, they only grin at it, and repeat gamesome stuff about “spouters” and “blubber-boilers,” and such like pretty exclamations. Why it is that all Merchant-seamen, and also all Pirates and Man-of-War’s men, and Slave-ship sailors, cherish such a scornful feeling towards Whale-ships; this is a question it would be hard to answer. Because, in the case of pirates, say, I should like to know whether that profession of theirs has any peculiar glory about it. It sometimes ends in uncommon elevation, indeed; but only at the gallows. And besides, when a man is elevated in that odd fashion, he has no proper foundation for his superior altitude. Hence, I conclude, that in boasting himself to be high lifted above a whaleman, in that assertion the pirate has no solid basis to stand on.

But what is a Gam? You might wear out your index-finger running up and down the columns of dictionaries, and never find the word. Dr. Johnson never attained to that erudition; Noah Webster’s ark does not hold it. Nevertheless, this same expressive word has now for many years been in constant use among some fifteen thousand true born Yankees. Certainly, it needs a definition, and should be incorporated into the Lexicon. With that view, let me learnedly define it.

GAM. NOUN—A social meeting of two (or more) Whaleships, generally on a cruising-ground; when, after exchanging hails, they exchange visits by boats’ crews: the two captains remaining, for the time, on board of one ship, and the two chief mates on the other.

There is another little item about Gamming which must not be forgotten here. All professions have their own little peculiarities of detail; so has the whale fishery. In a pirate, man-of-war, or slave ship, when the captain is rowed anywhere in his boat, he always sits in the stern sheets on a comfortable, sometimes cushioned seat there, and often steers himself with a pretty little milliner’s tiller decorated with gay cords and ribbons. But the whale-boat has no seat astern, no sofa of that sort whatever, and no tiller at all. High times indeed, if whaling captains were wheeled about the water on castors like gouty old aldermen in patent chairs. And as for a tiller, the whale-boat never admits of any such effeminacy; and therefore as in gamming a complete boat’s crew must leave the ship, and hence as the boat steerer or harpooneer is of the number, that subordinate is the steersman upon the occasion, and the captain, having no place to sit in, is pulled off to his visit all standing like a pine tree. And often you will notice that being conscious of the eyes of the whole visible world resting on him from the sides of the two ships, this standing captain is all alive to the importance of sustaining his dignity by maintaining his legs. Nor is this any very easy matter; for in his rear is the immense projecting steering oar hitting him now and then in the small of his back, the after-oar reciprocating by rapping his knees in front. He is thus completely wedged before and behind, and can only expand himself sideways by settling down on his stretched legs; but a sudden, violent pitch of the boat will often go far to topple him, because length of foundation is nothing without corresponding breadth. Merely make a spread angle of two poles, and you cannot stand them up. Then, again, it would never do in plain sight of the world’s riveted eyes, it would never do, I say, for this straddling captain to be seen steadying himself the slightest particle by catching hold of anything with his hands; indeed, as token of his entire, buoyant self-command, he generally carries his hands in his trowsers’ pockets; but perhaps being generally very large, heavy hands, he carries them there for ballast. Nevertheless there have occurred instances, well authenticated ones too, where the captain has been known for an uncommonly critical moment or two, in a sudden squall say—to seize hold of the nearest oarsman’s hair, and hold on there like grim death.






CHAPTER 54. The Town-Ho’s Story.
(As told at the Golden Inn.)

The Cape of Good Hope, and all the watery region round about there, is much like some noted four corners of a great highway, where you meet more travellers than in any other part.

It was not very long after speaking the Goney that another homeward-bound whaleman, the Town-Ho,* was encountered. She was manned almost wholly by Polynesians. In the short gam that ensued she gave us strong news of Moby Dick. To some the general interest in the White Whale was now wildly heightened by a circumstance of the Town-Ho’s story, which seemed obscurely to involve with the whale a certain wondrous, inverted visitation of one of those so called judgments of God which at times are said to overtake some men. This latter circumstance, with its own particular accompaniments, forming what may be called the secret part of the tragedy about to be narrated, never reached the ears of Captain Ahab or his mates. For that secret part of the story was unknown to the captain of the Town-Ho himself. It was the private property of three confederate white seamen of that ship, one of whom, it seems, communicated it to Tashtego with Romish injunctions of secrecy, but the following night Tashtego rambled in his sleep, and revealed so much of it in that way, that when he was wakened he could not well withhold the rest. Nevertheless, so potent an influence did this thing have on those seamen in the Pequod who came to the full knowledge of it, and by such a strange delicacy, to call it so, were they governed in this matter, that they kept the secret among themselves so that it never transpired abaft the Pequod’s main-mast. Interweaving in its proper place this darker thread with the story as publicly narrated on the ship, the whole of this strange affair I now proceed to put on lasting record.

*The ancient whale-cry upon first sighting a whale from the mast-head, still used by whalemen in hunting the famous Gallipagos terrapin.

For my humor’s sake, I shall preserve the style in which I once narrated it at Lima, to a lounging circle of my Spanish friends, one saint’s eve, smoking upon the thick-gilt tiled piazza of the Golden Inn. Of those fine cavaliers, the young Dons, Pedro and Sebastian, were on the closer terms with me; and hence the interluding questions they occasionally put, and which are duly answered at the time.

“Some two years prior to my first learning the events which I am about rehearsing to you, gentlemen, the Town-Ho, Sperm Whaler of Nantucket, was cruising in your Pacific here, not very many days’ sail eastward from the eaves of this good Golden Inn. She was somewhere to the northward of the Line. One morning upon handling the pumps, according to daily usage, it was observed that she made more water in her hold than common. They supposed a sword-fish had stabbed her, gentlemen. But the captain, having some unusual reason for believing that rare good luck awaited him in those latitudes; and therefore being very averse to quit them, and the leak not being then considered at all dangerous, though, indeed, they could not find it after searching the hold as low down as was possible in rather heavy weather, the ship still continued her cruisings, the mariners working at the pumps at wide and easy intervals; but no good luck came; more days went by, and not only was the leak yet undiscovered, but it sensibly increased. So much so, that now taking some alarm, the captain, making all sail, stood away for the nearest harbor among the islands, there to have his hull hove out and repaired.

“Though no small passage was before her, yet, if the commonest chance favoured, he did not at all fear that his ship would founder by the way, because his pumps were of the best, and being periodically relieved at them, those six-and-thirty men of his could easily keep the ship free; never mind if the leak should double on her. In truth, well nigh the whole of this passage being attended by very prosperous breezes, the Town-Ho had all but certainly arrived in perfect safety at her port without the occurrence of the least fatality, had it not been for the brutal overbearing of Radney, the mate, a Vineyarder, and the bitterly provoked vengeance of Steelkilt, a Lakeman and desperado from Buffalo.

“‘Lakeman!—Buffalo! Pray, what is a Lakeman, and where is Buffalo?’ said Don Sebastian, rising in his swinging mat of grass.

“On the eastern shore of our Lake Erie, Don; but—I crave your courtesy—may be, you shall soon hear further of all that. Now, gentlemen, in square-sail brigs and three-masted ships, well-nigh as large and stout as any that ever sailed out of your old Callao to far Manilla; this Lakeman, in the land-locked heart of our America, had yet been nurtured by all those agrarian freebooting impressions popularly connected with the open ocean. For in their interflowing aggregate, those grand fresh-water seas of ours,—Erie, and Ontario, and Huron, and Superior, and Michigan,—possess an ocean-like expansiveness, with many of the ocean’s noblest traits; with many of its rimmed varieties of races and of climes. They contain round archipelagoes of romantic isles, even as the Polynesian waters do; in large part, are shored by two great contrasting nations, as the Atlantic is; they furnish long maritime approaches to our numerous territorial colonies from the East, dotted all round their banks; here and there are frowned upon by batteries, and by the goat-like craggy guns of lofty Mackinaw; they have heard the fleet thunderings of naval victories; at intervals, they yield their beaches to wild barbarians, whose red painted faces flash from out their peltry wigwams; for leagues and leagues are flanked by ancient and unentered forests, where the gaunt pines stand like serried lines of kings in Gothic genealogies; those same woods harboring wild Afric beasts of prey, and silken creatures whose exported furs give robes to Tartar Emperors; they mirror the paved capitals of Buffalo and Cleveland, as well as Winnebago villages; they float alike the full-rigged merchant ship, the armed cruiser of the State, the steamer, and the beech canoe; they are swept by Borean and dismasting blasts as direful as any that lash the salted wave; they know what shipwrecks are, for out of sight of land, however inland, they have drowned full many a midnight ship with all its shrieking crew. Thus, gentlemen, though an inlander, Steelkilt was wild-ocean born, and wild-ocean nurtured; as much of an audacious mariner as any. And for Radney, though in his infancy he may have laid him down on the lone Nantucket beach, to nurse at his maternal sea; though in after life he had long followed our austere Atlantic and your contemplative Pacific; yet was he quite as vengeful and full of social quarrel as the backwoods seaman, fresh from the latitudes of buck-horn handled Bowie-knives. Yet was this Nantucketer a man with some good-hearted traits; and this Lakeman, a mariner, who though a sort of devil indeed, might yet by inflexible firmness, only tempered by that common decency of human recognition which is the meanest slave’s right; thus treated, this Steelkilt had long been retained harmless and docile. At all events, he had proved so thus far; but Radney was doomed and made mad, and Steelkilt—but, gentlemen, you shall hear.

“It was not more than a day or two at the furthest after pointing her prow for her island haven, that the Town-Ho’s leak seemed again increasing, but only so as to require an hour or more at the pumps every day. You must know that in a settled and civilized ocean like our Atlantic, for example, some skippers think little of pumping their whole way across it; though of a still, sleepy night, should the officer of the deck happen to forget his duty in that respect, the probability would be that he and his shipmates would never again remember it, on account of all hands gently subsiding to the bottom. Nor in the solitary and savage seas far from you to the westward, gentlemen, is it altogether unusual for ships to keep clanging at their pump-handles in full chorus even for a voyage of considerable length; that is, if it lie along a tolerably accessible coast, or if any other reasonable retreat is afforded them. It is only when a leaky vessel is in some very out of the way part of those waters, some really landless latitude, that her captain begins to feel a little anxious.

“Much this way had it been with the Town-Ho; so when her leak was found gaining once more, there was in truth some small concern manifested by several of her company; especially by Radney the mate. He commanded the upper sails to be well hoisted, sheeted home anew, and every way expanded to the breeze. Now this Radney, I suppose, was as little of a coward, and as little inclined to any sort of nervous apprehensiveness touching his own person as any fearless, unthinking creature on land or on sea that you can conveniently imagine, gentlemen. Therefore when he betrayed this solicitude about the safety of the ship, some of the seamen declared that it was only on account of his being a part owner in her. So when they were working that evening at the pumps, there was on this head no small gamesomeness slily going on among them, as they stood with their feet continually overflowed by the rippling clear water; clear as any mountain spring, gentlemen—that bubbling from the pumps ran across the deck, and poured itself out in steady spouts at the lee scupper-holes.

“Now, as you well know, it is not seldom the case in this conventional world of ours—watery or otherwise; that when a person placed in command over his fellow-men finds one of them to be very significantly his superior in general pride of manhood, straightway against that man he conceives an unconquerable dislike and bitterness; and if he have a chance he will pull down and pulverize that subaltern’s tower, and make a little heap of dust of it. Be this conceit of mine as it may, gentlemen, at all events Steelkilt was a tall and noble animal with a head like a Roman, and a flowing golden beard like the tasseled housings of your last viceroy’s snorting charger; and a brain, and a heart, and a soul in him, gentlemen, which had made Steelkilt Charlemagne, had he been born son to Charlemagne’s father. But Radney, the mate, was ugly as a mule; yet as hardy, as stubborn, as malicious. He did not love Steelkilt, and Steelkilt knew it.

“Espying the mate drawing near as he was toiling at the pump with the rest, the Lakeman affected not to notice him, but unawed, went on with his gay banterings.

“‘Aye, aye, my merry lads, it’s a lively leak this; hold a cannikin, one of ye, and let’s have a taste. By the Lord, it’s worth bottling! I tell ye what, men, old Rad’s investment must go for it! he had best cut away his part of the hull and tow it home. The fact is, boys, that sword-fish only began the job; he’s come back again with a gang of ship-carpenters, saw-fish, and file-fish, and what not; and the whole posse of ’em are now hard at work cutting and slashing at the bottom; making improvements, I suppose. If old Rad were here now, I’d tell him to jump overboard and scatter ’em. They’re playing the devil with his estate, I can tell him. But he’s a simple old soul,—Rad, and a beauty too. Boys, they say the rest of his property is invested in looking-glasses. I wonder if he’d give a poor devil like me the model of his nose.’

“‘Damn your eyes! what’s that pump stopping for?’ roared Radney, pretending not to have heard the sailors’ talk. ‘Thunder away at it!’

“‘Aye, aye, sir,’ said Steelkilt, merry as a cricket. ‘Lively, boys, lively, now!’ And with that the pump clanged like fifty fire-engines; the men tossed their hats off to it, and ere long that peculiar gasping of the lungs was heard which denotes the fullest tension of life’s utmost energies.

“Quitting the pump at last, with the rest of his band, the Lakeman went forward all panting, and sat himself down on the windlass; his face fiery red, his eyes bloodshot, and wiping the profuse sweat from his brow. Now what cozening fiend it was, gentlemen, that possessed Radney to meddle with such a man in that corporeally exasperated state, I know not; but so it happened. Intolerably striding along the deck, the mate commanded him to get a broom and sweep down the planks, and also a shovel, and remove some offensive matters consequent upon allowing a pig to run at large.

“Now, gentlemen, sweeping a ship’s deck at sea is a piece of household work which in all times but raging gales is regularly attended to every evening; it has been known to be done in the case of ships actually foundering at the time. Such, gentlemen, is the inflexibility of sea-usages and the instinctive love of neatness in seamen; some of whom would not willingly drown without first washing their faces. But in all vessels this broom business is the prescriptive province of the boys, if boys there be aboard. Besides, it was the stronger men in the Town-Ho that had been divided into gangs, taking turns at the pumps; and being the most athletic seaman of them all, Steelkilt had been regularly assigned captain of one of the gangs; consequently he should have been freed from any trivial business not connected with truly nautical duties, such being the case with his comrades. I mention all these particulars so that you may understand exactly how this affair stood between the two men.

“But there was more than this: the order about the shovel was almost as plainly meant to sting and insult Steelkilt, as though Radney had spat in his face. Any man who has gone sailor in a whale-ship will understand this; and all this and doubtless much more, the Lakeman fully comprehended when the mate uttered his command. But as he sat still for a moment, and as he steadfastly looked into the mate’s malignant eye and perceived the stacks of powder-casks heaped up in him and the slow-match silently burning along towards them; as he instinctively saw all this, that strange forbearance and unwillingness to stir up the deeper passionateness in any already ireful being—a repugnance most felt, when felt at all, by really valiant men even when aggrieved—this nameless phantom feeling, gentlemen, stole over Steelkilt.

“Therefore, in his ordinary tone, only a little broken by the bodily exhaustion he was temporarily in, he answered him saying that sweeping the deck was not his business, and he would not do it. And then, without at all alluding to the shovel, he pointed to three lads as the customary sweepers; who, not being billeted at the pumps, had done little or nothing all day. To this, Radney replied with an oath, in a most domineering and outrageous manner unconditionally reiterating his command; meanwhile advancing upon the still seated Lakeman, with an uplifted cooper’s club hammer which he had snatched from a cask near by.

“Heated and irritated as he was by his spasmodic toil at the pumps, for all his first nameless feeling of forbearance the sweating Steelkilt could but ill brook this bearing in the mate; but somehow still smothering the conflagration within him, without speaking he remained doggedly rooted to his seat, till at last the incensed Radney shook the hammer within a few inches of his face, furiously commanding him to do his bidding.

“Steelkilt rose, and slowly retreating round the windlass, steadily followed by the mate with his menacing hammer, deliberately repeated his intention not to obey. Seeing, however, that his forbearance had not the slightest effect, by an awful and unspeakable intimation with his twisted hand he warned off the foolish and infatuated man; but it was to no purpose. And in this way the two went once slowly round the windlass; when, resolved at last no longer to retreat, bethinking him that he had now forborne as much as comported with his humor, the Lakeman paused on the hatches and thus spoke to the officer:

“‘Mr. Radney, I will not obey you. Take that hammer away, or look to yourself.’ But the predestinated mate coming still closer to him, where the Lakeman stood fixed, now shook the heavy hammer within an inch of his teeth; meanwhile repeating a string of insufferable maledictions. Retreating not the thousandth part of an inch; stabbing him in the eye with the unflinching poniard of his glance, Steelkilt, clenching his right hand behind him and creepingly drawing it back, told his persecutor that if the hammer but grazed his cheek he (Steelkilt) would murder him. But, gentlemen, the fool had been branded for the slaughter by the gods. Immediately the hammer touched the cheek; the next instant the lower jaw of the mate was stove in his head; he fell on the hatch spouting blood like a whale.

“Ere the cry could go aft Steelkilt was shaking one of the backstays leading far aloft to where two of his comrades were standing their mastheads. They were both Canallers.

“‘Canallers!’ cried Don Pedro. ‘We have seen many whale-ships in our harbours, but never heard of your Canallers. Pardon: who and what are they?’

“‘Canallers, Don, are the boatmen belonging to our grand Erie Canal. You must have heard of it.’

“‘Nay, Senor; hereabouts in this dull, warm, most lazy, and hereditary land, we know but little of your vigorous North.’

“‘Aye? Well then, Don, refill my cup. Your chicha’s very fine; and ere proceeding further I will tell ye what our Canallers are; for such information may throw side-light upon my story.’

“For three hundred and sixty miles, gentlemen, through the entire breadth of the state of New York; through numerous populous cities and most thriving villages; through long, dismal, uninhabited swamps, and affluent, cultivated fields, unrivalled for fertility; by billiard-room and bar-room; through the holy-of-holies of great forests; on Roman arches over Indian rivers; through sun and shade; by happy hearts or broken; through all the wide contrasting scenery of those noble Mohawk counties; and especially, by rows of snow-white chapels, whose spires stand almost like milestones, flows one continual stream of Venetianly corrupt and often lawless life. There’s your true Ashantee, gentlemen; there howl your pagans; where you ever find them, next door to you; under the long-flung shadow, and the snug patronising lee of churches. For by some curious fatality, as it is often noted of your metropolitan freebooters that they ever encamp around the halls of justice, so sinners, gentlemen, most abound in holiest vicinities.

“‘Is that a friar passing?’ said Don Pedro, looking downwards into the crowded plazza, with humorous concern.

“‘Well for our northern friend, Dame Isabella’s Inquisition wanes in Lima,’ laughed Don Sebastian. ‘Proceed, Senor.’

“‘A moment! Pardon!’ cried another of the company. ‘In the name of all us Limeese, I but desire to express to you, sir sailor, that we have by no means overlooked your delicacy in not substituting present Lima for distant Venice in your corrupt comparison. Oh! do not bow and look surprised; you know the proverb all along this coast—“Corrupt as Lima.” It but bears out your saying, too; churches more plentiful than billiard-tables, and for ever open—and “Corrupt as Lima.” So, too, Venice; I have been there; the holy city of the blessed evangelist, St. Mark!—St. Dominic, purge it! Your cup! Thanks: here I refill; now, you pour out again.’

“Freely depicted in his own vocation, gentlemen, the Canaller would make a fine dramatic hero, so abundantly and picturesquely wicked is he. Like Mark Antony, for days and days along his green-turfed, flowery Nile, he indolently floats, openly toying with his red-cheeked Cleopatra, ripening his apricot thigh upon the sunny deck. But ashore, all this effeminacy is dashed. The brigandish guise which the Canaller so proudly sports; his slouched and gaily-ribboned hat betoken his grand features. A terror to the smiling innocence of the villages through which he floats; his swart visage and bold swagger are not unshunned in cities. Once a vagabond on his own canal, I have received good turns from one of these Canallers; I thank him heartily; would fain be not ungrateful; but it is often one of the prime redeeming qualities of your man of violence, that at times he has as stiff an arm to back a poor stranger in a strait, as to plunder a wealthy one. In sum, gentlemen, what the wildness of this canal life is, is emphatically evinced by this; that our wild whale-fishery contains so many of its most finished graduates, and that scarce any race of mankind, except Sydney men, are so much distrusted by our whaling captains. Nor does it at all diminish the curiousness of this matter, that to many thousands of our rural boys and young men born along its line, the probationary life of the Grand Canal furnishes the sole transition between quietly reaping in a Christian corn-field, and recklessly ploughing the waters of the most barbaric seas.

“‘I see! I see!’ impetuously exclaimed Don Pedro, spilling his chicha upon his silvery ruffles. ‘No need to travel! The world’s one Lima. I had thought, now, that at your temperate North the generations were cold and holy as the hills.—But the story.’

“I left off, gentlemen, where the Lakeman shook the backstay. Hardly had he done so, when he was surrounded by the three junior mates and the four harpooneers, who all crowded him to the deck. But sliding down the ropes like baleful comets, the two Canallers rushed into the uproar, and sought to drag their man out of it towards the forecastle. Others of the sailors joined with them in this attempt, and a twisted turmoil ensued; while standing out of harm’s way, the valiant captain danced up and down with a whale-pike, calling upon his officers to manhandle that atrocious scoundrel, and smoke him along to the quarter-deck. At intervals, he ran close up to the revolving border of the confusion, and prying into the heart of it with his pike, sought to prick out the object of his resentment. But Steelkilt and his desperadoes were too much for them all; they succeeded in gaining the forecastle deck, where, hastily slewing about three or four large casks in a line with the windlass, these sea-Parisians entrenched themselves behind the barricade.

“‘Come out of that, ye pirates!’ roared the captain, now menacing them with a pistol in each hand, just brought to him by the steward. ‘Come out of that, ye cut-throats!’

“Steelkilt leaped on the barricade, and striding up and down there, defied the worst the pistols could do; but gave the captain to understand distinctly, that his (Steelkilt’s) death would be the signal for a murderous mutiny on the part of all hands. Fearing in his heart lest this might prove but too true, the captain a little desisted, but still commanded the insurgents instantly to return to their duty.

“‘Will you promise not to touch us, if we do?’ demanded their ringleader.

“‘Turn to! turn to!—I make no promise;—to your duty! Do you want to sink the ship, by knocking off at a time like this? Turn to!’ and he once more raised a pistol.

“‘Sink the ship?’ cried Steelkilt. ‘Aye, let her sink. Not a man of us turns to, unless you swear not to raise a rope-yarn against us. What say ye, men?’ turning to his comrades. A fierce cheer was their response.

“The Lakeman now patrolled the barricade, all the while keeping his eye on the Captain, and jerking out such sentences as these:—‘It’s not our fault; we didn’t want it; I told him to take his hammer away; it was boy’s business; he might have known me before this; I told him not to prick the buffalo; I believe I have broken a finger here against his cursed jaw; ain’t those mincing knives down in the forecastle there, men? look to those handspikes, my hearties. Captain, by God, look to yourself; say the word; don’t be a fool; forget it all; we are ready to turn to; treat us decently, and we’re your men; but we won’t be flogged.’

“‘Turn to! I make no promises, turn to, I say!’

“‘Look ye, now,’ cried the Lakeman, flinging out his arm towards him, ‘there are a few of us here (and I am one of them) who have shipped for the cruise, d’ye see; now as you well know, sir, we can claim our discharge as soon as the anchor is down; so we don’t want a row; it’s not our interest; we want to be peaceable; we are ready to work, but we won’t be flogged.’

“‘Turn to!’ roared the Captain.

“Steelkilt glanced round him a moment, and then said:—‘I tell you what it is now, Captain, rather than kill ye, and be hung for such a shabby rascal, we won’t lift a hand against ye unless ye attack us; but till you say the word about not flogging us, we don’t do a hand’s turn.’

“‘Down into the forecastle then, down with ye, I’ll keep ye there till ye’re sick of it. Down ye go.’

“‘Shall we?’ cried the ringleader to his men. Most of them were against it; but at length, in obedience to Steelkilt, they preceded him down into their dark den, growlingly disappearing, like bears into a cave.

“As the Lakeman’s bare head was just level with the planks, the Captain and his posse leaped the barricade, and rapidly drawing over the slide of the scuttle, planted their group of hands upon it, and loudly called for the steward to bring the heavy brass padlock belonging to the companionway. Then opening the slide a little, the Captain whispered something down the crack, closed it, and turned the key upon them—ten in number—leaving on deck some twenty or more, who thus far had remained neutral.

“All night a wide-awake watch was kept by all the officers, forward and aft, especially about the forecastle scuttle and fore hatchway; at which last place it was feared the insurgents might emerge, after breaking through the bulkhead below. But the hours of darkness passed in peace; the men who still remained at their duty toiling hard at the pumps, whose clinking and clanking at intervals through the dreary night dismally resounded through the ship.

“At sunrise the Captain went forward, and knocking on the deck, summoned the prisoners to work; but with a yell they refused. Water was then lowered down to them, and a couple of handfuls of biscuit were tossed after it; when again turning the key upon them and pocketing it, the Captain returned to the quarter-deck. Twice every day for three days this was repeated; but on the fourth morning a confused wrangling, and then a scuffling was heard, as the customary summons was delivered; and suddenly four men burst up from the forecastle, saying they were ready to turn to. The fetid closeness of the air, and a famishing diet, united perhaps to some fears of ultimate retribution, had constrained them to surrender at discretion. Emboldened by this, the Captain reiterated his demand to the rest, but Steelkilt shouted up to him a terrific hint to stop his babbling and betake himself where he belonged. On the fifth morning three others of the mutineers bolted up into the air from the desperate arms below that sought to restrain them. Only three were left.

“‘Better turn to, now?’ said the Captain with a heartless jeer.

“‘Shut us up again, will ye!’ cried Steelkilt.

“‘Oh certainly,’ said the Captain, and the key clicked.

“It was at this point, gentlemen, that enraged by the defection of seven of his former associates, and stung by the mocking voice that had last hailed him, and maddened by his long entombment in a place as black as the bowels of despair; it was then that Steelkilt proposed to the two Canallers, thus far apparently of one mind with him, to burst out of their hole at the next summoning of the garrison; and armed with their keen mincing knives (long, crescentic, heavy implements with a handle at each end) run amuck from the bowsprit to the taffrail; and if by any devilishness of desperation possible, seize the ship. For himself, he would do this, he said, whether they joined him or not. That was the last night he should spend in that den. But the scheme met with no opposition on the part of the other two; they swore they were ready for that, or for any other mad thing, for anything in short but a surrender. And what was more, they each insisted upon being the first man on deck, when the time to make the rush should come. But to this their leader as fiercely objected, reserving that priority for himself; particularly as his two comrades would not yield, the one to the other, in the matter; and both of them could not be first, for the ladder would but admit one man at a time. And here, gentlemen, the foul play of these miscreants must come out.

“Upon hearing the frantic project of their leader, each in his own separate soul had suddenly lighted, it would seem, upon the same piece of treachery, namely: to be foremost in breaking out, in order to be the first of the three, though the last of the ten, to surrender; and thereby secure whatever small chance of pardon such conduct might merit. But when Steelkilt made known his determination still to lead them to the last, they in some way, by some subtle chemistry of villany, mixed their before secret treacheries together; and when their leader fell into a doze, verbally opened their souls to each other in three sentences; and bound the sleeper with cords, and gagged him with cords; and shrieked out for the Captain at midnight.

“Thinking murder at hand, and smelling in the dark for the blood, he and all his armed mates and harpooneers rushed for the forecastle. In a few minutes the scuttle was opened, and, bound hand and foot, the still struggling ringleader was shoved up into the air by his perfidious allies, who at once claimed the honor of securing a man who had been fully ripe for murder. But all these were collared, and dragged along the deck like dead cattle; and, side by side, were seized up into the mizzen rigging, like three quarters of meat, and there they hung till morning. ‘Damn ye,’ cried the Captain, pacing to and fro before them, ‘the vultures would not touch ye, ye villains!’

“At sunrise he summoned all hands; and separating those who had rebelled from those who had taken no part in the mutiny, he told the former that he had a good mind to flog them all round—thought, upon the whole, he would do so—he ought to—justice demanded it; but for the present, considering their timely surrender, he would let them go with a reprimand, which he accordingly administered in the vernacular.

“‘But as for you, ye carrion rogues,’ turning to the three men in the rigging—‘for you, I mean to mince ye up for the try-pots;’ and, seizing a rope, he applied it with all his might to the backs of the two traitors, till they yelled no more, but lifelessly hung their heads sideways, as the two crucified thieves are drawn.

“‘My wrist is sprained with ye!’ he cried, at last; ‘but there is still rope enough left for you, my fine bantam, that wouldn’t give up. Take that gag from his mouth, and let us hear what he can say for himself.’

“For a moment the exhausted mutineer made a tremulous motion of his cramped jaws, and then painfully twisting round his head, said in a sort of hiss, ‘What I say is this—and mind it well—if you flog me, I murder you!’

“‘Say ye so? then see how ye frighten me’—and the Captain drew off with the rope to strike.

“‘Best not,’ hissed the Lakeman.

“‘But I must,’—and the rope was once more drawn back for the stroke.

“Steelkilt here hissed out something, inaudible to all but the Captain; who, to the amazement of all hands, started back, paced the deck rapidly two or three times, and then suddenly throwing down his rope, said, ‘I won’t do it—let him go—cut him down: d’ye hear?’

“But as the junior mates were hurrying to execute the order, a pale man, with a bandaged head, arrested them—Radney the chief mate. Ever since the blow, he had lain in his berth; but that morning, hearing the tumult on the deck, he had crept out, and thus far had watched the whole scene. Such was the state of his mouth, that he could hardly speak; but mumbling something about his being willing and able to do what the captain dared not attempt, he snatched the rope and advanced to his pinioned foe.

“‘You are a coward!’ hissed the Lakeman.

“‘So I am, but take that.’ The mate was in the very act of striking, when another hiss stayed his uplifted arm. He paused: and then pausing no more, made good his word, spite of Steelkilt’s threat, whatever that might have been. The three men were then cut down, all hands were turned to, and, sullenly worked by the moody seamen, the iron pumps clanged as before.

“Just after dark that day, when one watch had retired below, a clamor was heard in the forecastle; and the two trembling traitors running up, besieged the cabin door, saying they durst not consort with the crew. Entreaties, cuffs, and kicks could not drive them back, so at their own instance they were put down in the ship’s run for salvation. Still, no sign of mutiny reappeared among the rest. On the contrary, it seemed, that mainly at Steelkilt’s instigation, they had resolved to maintain the strictest peacefulness, obey all orders to the last, and, when the ship reached port, desert her in a body. But in order to insure the speediest end to the voyage, they all agreed to another thing—namely, not to sing out for whales, in case any should be discovered. For, spite of her leak, and spite of all her other perils, the Town-Ho still maintained her mast-heads, and her captain was just as willing to lower for a fish that moment, as on the day his craft first struck the cruising ground; and Radney the mate was quite as ready to change his berth for a boat, and with his bandaged mouth seek to gag in death the vital jaw of the whale.

“But though the Lakeman had induced the seamen to adopt this sort of passiveness in their conduct, he kept his own counsel (at least till all was over) concerning his own proper and private revenge upon the man who had stung him in the ventricles of his heart. He was in Radney the chief mate’s watch; and as if the infatuated man sought to run more than half way to meet his doom, after the scene at the rigging, he insisted, against the express counsel of the captain, upon resuming the head of his watch at night. Upon this, and one or two other circumstances, Steelkilt systematically built the plan of his revenge.

“During the night, Radney had an unseamanlike way of sitting on the bulwarks of the quarter-deck, and leaning his arm upon the gunwale of the boat which was hoisted up there, a little above the ship’s side. In this attitude, it was well known, he sometimes dozed. There was a considerable vacancy between the boat and the ship, and down between this was the sea. Steelkilt calculated his time, and found that his next trick at the helm would come round at two o’clock, in the morning of the third day from that in which he had been betrayed. At his leisure, he employed the interval in braiding something very carefully in his watches below.

“‘What are you making there?’ said a shipmate.

“‘What do you think? what does it look like?’

“‘Like a lanyard for your bag; but it’s an odd one, seems to me.’

“‘Yes, rather oddish,’ said the Lakeman, holding it at arm’s length before him; ‘but I think it will answer. Shipmate, I haven’t enough twine,—have you any?’

“But there was none in the forecastle.

“‘Then I must get some from old Rad;’ and he rose to go aft.

“‘You don’t mean to go a begging to him!’ said a sailor.

“‘Why not? Do you think he won’t do me a turn, when it’s to help himself in the end, shipmate?’ and going to the mate, he looked at him quietly, and asked him for some twine to mend his hammock. It was given him—neither twine nor lanyard were seen again; but the next night an iron ball, closely netted, partly rolled from the pocket of the Lakeman’s monkey jacket, as he was tucking the coat into his hammock for a pillow. Twenty-four hours after, his trick at the silent helm—nigh to the man who was apt to doze over the grave always ready dug to the seaman’s hand—that fatal hour was then to come; and in the fore-ordaining soul of Steelkilt, the mate was already stark and stretched as a corpse, with his forehead crushed in.

“But, gentlemen, a fool saved the would-be murderer from the bloody deed he had planned. Yet complete revenge he had, and without being the avenger. For by a mysterious fatality, Heaven itself seemed to step in to take out of his hands into its own the damning thing he would have done.

“It was just between daybreak and sunrise of the morning of the second day, when they were washing down the decks, that a stupid Teneriffe man, drawing water in the main-chains, all at once shouted out, ‘There she rolls! there she rolls!’ Jesu, what a whale! It was Moby Dick.

“‘Moby Dick!’ cried Don Sebastian; ‘St. Dominic! Sir sailor, but do whales have christenings? Whom call you Moby Dick?’

“‘A very white, and famous, and most deadly immortal monster, Don;—but that would be too long a story.’

“‘How? how?’ cried all the young Spaniards, crowding.

“‘Nay, Dons, Dons—nay, nay! I cannot rehearse that now. Let me get more into the air, Sirs.’

“‘The chicha! the chicha!’ cried Don Pedro; ‘our vigorous friend looks faint;—fill up his empty glass!’

“No need, gentlemen; one moment, and I proceed.—Now, gentlemen, so suddenly perceiving the snowy whale within fifty yards of the ship—forgetful of the compact among the crew—in the excitement of the moment, the Teneriffe man had instinctively and involuntarily lifted his voice for the monster, though for some little time past it had been plainly beheld from the three sullen mast-heads. All was now a phrensy. ‘The White Whale—the White Whale!’ was the cry from captain, mates, and harpooneers, who, undeterred by fearful rumours, were all anxious to capture so famous and precious a fish; while the dogged crew eyed askance, and with curses, the appalling beauty of the vast milky mass, that lit up by a horizontal spangling sun, shifted and glistened like a living opal in the blue morning sea. Gentlemen, a strange fatality pervades the whole career of these events, as if verily mapped out before the world itself was charted. The mutineer was the bowsman of the mate, and when fast to a fish, it was his duty to sit next him, while Radney stood up with his lance in the prow, and haul in or slacken the line, at the word of command. Moreover, when the four boats were lowered, the mate’s got the start; and none howled more fiercely with delight than did Steelkilt, as he strained at his oar. After a stiff pull, their harpooneer got fast, and, spear in hand, Radney sprang to the bow. He was always a furious man, it seems, in a boat. And now his bandaged cry was, to beach him on the whale’s topmost back. Nothing loath, his bowsman hauled him up and up, through a blinding foam that blent two whitenesses together; till of a sudden the boat struck as against a sunken ledge, and keeling over, spilled out the standing mate. That instant, as he fell on the whale’s slippery back, the boat righted, and was dashed aside by the swell, while Radney was tossed over into the sea, on the other flank of the whale. He struck out through the spray, and, for an instant, was dimly seen through that veil, wildly seeking to remove himself from the eye of Moby Dick. But the whale rushed round in a sudden maelstrom; seized the swimmer between his jaws; and rearing high up with him, plunged headlong again, and went down.

“Meantime, at the first tap of the boat’s bottom, the Lakeman had slackened the line, so as to drop astern from the whirlpool; calmly looking on, he thought his own thoughts. But a sudden, terrific, downward jerking of the boat, quickly brought his knife to the line. He cut it; and the whale was free. But, at some distance, Moby Dick rose again, with some tatters of Radney’s red woollen shirt, caught in the teeth that had destroyed him. All four boats gave chase again; but the whale eluded them, and finally wholly disappeared.

“In good time, the Town-Ho reached her port—a savage, solitary place—where no civilized creature resided. There, headed by the Lakeman, all but five or six of the foremastmen deliberately deserted among the palms; eventually, as it turned out, seizing a large double war-canoe of the savages, and setting sail for some other harbor.

“The ship’s company being reduced to but a handful, the captain called upon the Islanders to assist him in the laborious business of heaving down the ship to stop the leak. But to such unresting vigilance over their dangerous allies was this small band of whites necessitated, both by night and by day, and so extreme was the hard work they underwent, that upon the vessel being ready again for sea, they were in such a weakened condition that the captain durst not put off with them in so heavy a vessel. After taking counsel with his officers, he anchored the ship as far off shore as possible; loaded and ran out his two cannon from the bows; stacked his muskets on the poop; and warning the Islanders not to approach the ship at their peril, took one man with him, and setting the sail of his best whale-boat, steered straight before the wind for Tahiti, five hundred miles distant, to procure a reinforcement to his crew.

“On the fourth day of the sail, a large canoe was descried, which seemed to have touched at a low isle of corals. He steered away from it; but the savage craft bore down on him; and soon the voice of Steelkilt hailed him to heave to, or he would run him under water. The captain presented a pistol. With one foot on each prow of the yoked war-canoes, the Lakeman laughed him to scorn; assuring him that if the pistol so much as clicked in the lock, he would bury him in bubbles and foam.

“‘What do you want of me?’ cried the captain.

“‘Where are you bound? and for what are you bound?’ demanded Steelkilt; ‘no lies.’

“‘I am bound to Tahiti for more men.’

“‘Very good. Let me board you a moment—I come in peace.’ With that he leaped from the canoe, swam to the boat; and climbing the gunwale, stood face to face with the captain.

“‘Cross your arms, sir; throw back your head. Now, repeat after me. As soon as Steelkilt leaves me, I swear to beach this boat on yonder island, and remain there six days. If I do not, may lightnings strike me!’

“‘A pretty scholar,’ laughed the Lakeman. ‘Adios, Senor!’ and leaping into the sea, he swam back to his comrades.

“Watching the boat till it was fairly beached, and drawn up to the roots of the cocoa-nut trees, Steelkilt made sail again, and in due time arrived at Tahiti, his own place of destination. There, luck befriended him; two ships were about to sail for France, and were providentially in want of precisely that number of men which the sailor headed. They embarked; and so for ever got the start of their former captain, had he been at all minded to work them legal retribution.

“Some ten days after the French ships sailed, the whale-boat arrived, and the captain was forced to enlist some of the more civilized Tahitians, who had been somewhat used to the sea. Chartering a small native schooner, he returned with them to his vessel; and finding all right there, again resumed his cruisings.

“Where Steelkilt now is, gentlemen, none know; but upon the island of Nantucket, the widow of Radney still turns to the sea which refuses to give up its dead; still in dreams sees the awful white whale that destroyed him. * * * *

“‘Are you through?’ said Don Sebastian, quietly.

“‘I am, Don.’

“‘Then I entreat you, tell me if to the best of your own convictions, this your story is in substance really true? It is so passing wonderful! Did you get it from an unquestionable source? Bear with me if I seem to press.’

“‘Also bear with all of us, sir sailor; for we all join in Don Sebastian’s suit,’ cried the company, with exceeding interest.

“‘Is there a copy of the Holy Evangelists in the Golden Inn, gentlemen?’

“‘Nay,’ said Don Sebastian; ‘but I know a worthy priest near by, who will quickly procure one for me. I go for it; but are you well advised? this may grow too serious.’

“‘Will you be so good as to bring the priest also, Don?’

“‘Though there are no Auto-da-Fés in Lima now,’ said one of the company to another; ‘I fear our sailor friend runs risk of the archiepiscopacy. Let us withdraw more out of the moonlight. I see no need of this.’

“‘Excuse me for running after you, Don Sebastian; but may I also beg that you will be particular in procuring the largest sized Evangelists you can.’

* * * * * *

“‘This is the priest, he brings you the Evangelists,’ said Don Sebastian, gravely, returning with a tall and solemn figure.

“‘Let me remove my hat. Now, venerable priest, further into the light, and hold the Holy Book before me that I may touch it.

“‘So help me Heaven, and on my honor the story I have told ye, gentlemen, is in substance and its great items, true. I know it to be true; it happened on this ball; I trod the ship; I knew the crew; I have seen and talked with Steelkilt since the death of Radney.’”






CHAPTER 55. Of the Monstrous Pictures of Whales.
I shall ere long paint to you as well as one can without canvas, something like the true form of the whale as he actually appears to the eye of the whaleman when in his own absolute body the whale is moored alongside the whale-ship so that he can be fairly stepped upon there. It may be worth while, therefore, previously to advert to those curious imaginary portraits of him which even down to the present day confidently challenge the faith of the landsman. It is time to set the world right in this matter, by proving such pictures of the whale all wrong.

It may be that the primal source of all those pictorial delusions will be found among the oldest Hindoo, Egyptian, and Grecian sculptures. For ever since those inventive but unscrupulous times when on the marble panellings of temples, the pedestals of statues, and on shields, medallions, cups, and coins, the dolphin was drawn in scales of chain-armor like Saladin’s, and a helmeted head like St. George’s; ever since then has something of the same sort of license prevailed, not only in most popular pictures of the whale, but in many scientific presentations of him.

Now, by all odds, the most ancient extant portrait anyways purporting to be the whale’s, is to be found in the famous cavern-pagoda of Elephanta, in India. The Brahmins maintain that in the almost endless sculptures of that immemorial pagoda, all the trades and pursuits, every conceivable avocation of man, were prefigured ages before any of them actually came into being. No wonder then, that in some sort our noble profession of whaling should have been there shadowed forth. The Hindoo whale referred to, occurs in a separate department of the wall, depicting the incarnation of Vishnu in the form of leviathan, learnedly known as the Matse Avatar. But though this sculpture is half man and half whale, so as only to give the tail of the latter, yet that small section of him is all wrong. It looks more like the tapering tail of an anaconda, than the broad palms of the true whale’s majestic flukes.

But go to the old Galleries, and look now at a great Christian painter’s portrait of this fish; for he succeeds no better than the antediluvian Hindoo. It is Guido’s picture of Perseus rescuing Andromeda from the sea-monster or whale. Where did Guido get the model of such a strange creature as that? Nor does Hogarth, in painting the same scene in his own “Perseus Descending,” make out one whit better. The huge corpulence of that Hogarthian monster undulates on the surface, scarcely drawing one inch of water. It has a sort of howdah on its back, and its distended tusked mouth into which the billows are rolling, might be taken for the Traitors’ Gate leading from the Thames by water into the Tower. Then, there are the Prodromus whales of old Scotch Sibbald, and Jonah’s whale, as depicted in the prints of old Bibles and the cuts of old primers. What shall be said of these? As for the book-binder’s whale winding like a vine-stalk round the stock of a descending anchor—as stamped and gilded on the backs and title-pages of many books both old and new—that is a very picturesque but purely fabulous creature, imitated, I take it, from the like figures on antique vases. Though universally denominated a dolphin, I nevertheless call this book-binder’s fish an attempt at a whale; because it was so intended when the device was first introduced. It was introduced by an old Italian publisher somewhere about the 15th century, during the Revival of Learning; and in those days, and even down to a comparatively late period, dolphins were popularly supposed to be a species of the Leviathan.

In the vignettes and other embellishments of some ancient books you will at times meet with very curious touches at the whale, where all manner of spouts, jets d’eau, hot springs and cold, Saratoga and Baden-Baden, come bubbling up from his unexhausted brain. In the title-page of the original edition of the “Advancement of Learning” you will find some curious whales.

But quitting all these unprofessional attempts, let us glance at those pictures of leviathan purporting to be sober, scientific delineations, by those who know. In old Harris’s collection of voyages there are some plates of whales extracted from a Dutch book of voyages, A.D. 1671, entitled “A Whaling Voyage to Spitzbergen in the ship Jonas in the Whale, Peter Peterson of Friesland, master.” In one of those plates the whales, like great rafts of logs, are represented lying among ice-isles, with white bears running over their living backs. In another plate, the prodigious blunder is made of representing the whale with perpendicular flukes.

Then again, there is an imposing quarto, written by one Captain Colnett, a Post Captain in the English navy, entitled “A Voyage round Cape Horn into the South Seas, for the purpose of extending the Spermaceti Whale Fisheries.” In this book is an outline purporting to be a “Picture of a Physeter or Spermaceti whale, drawn by scale from one killed on the coast of Mexico, August, 1793, and hoisted on deck.” I doubt not the captain had this veracious picture taken for the benefit of his marines. To mention but one thing about it, let me say that it has an eye which applied, according to the accompanying scale, to a full grown sperm whale, would make the eye of that whale a bow-window some five feet long. Ah, my gallant captain, why did ye not give us Jonah looking out of that eye!

Nor are the most conscientious compilations of Natural History for the benefit of the young and tender, free from the same heinousness of mistake. Look at that popular work “Goldsmith’s Animated Nature.” In the abridged London edition of 1807, there are plates of an alleged “whale” and a “narwhale.” I do not wish to seem inelegant, but this unsightly whale looks much like an amputated sow; and, as for the narwhale, one glimpse at it is enough to amaze one, that in this nineteenth century such a hippogriff could be palmed for genuine upon any intelligent public of schoolboys.

Then, again, in 1825, Bernard Germain, Count de Lacépède, a great naturalist, published a scientific systemized whale book, wherein are several pictures of the different species of the Leviathan. All these are not only incorrect, but the picture of the Mysticetus or Greenland whale (that is to say, the Right whale), even Scoresby, a long experienced man as touching that species, declares not to have its counterpart in nature.

But the placing of the cap-sheaf to all this blundering business was reserved for the scientific Frederick Cuvier, brother to the famous Baron. In 1836, he published a Natural History of Whales, in which he gives what he calls a picture of the Sperm Whale. Before showing that picture to any Nantucketer, you had best provide for your summary retreat from Nantucket. In a word, Frederick Cuvier’s Sperm Whale is not a Sperm Whale, but a squash. Of course, he never had the benefit of a whaling voyage (such men seldom have), but whence he derived that picture, who can tell? Perhaps he got it as his scientific predecessor in the same field, Desmarest, got one of his authentic abortions; that is, from a Chinese drawing. And what sort of lively lads with the pencil those Chinese are, many queer cups and saucers inform us.

As for the sign-painters’ whales seen in the streets hanging over the shops of oil-dealers, what shall be said of them? They are generally Richard III. whales, with dromedary humps, and very savage; breakfasting on three or four sailor tarts, that is whaleboats full of mariners: their deformities floundering in seas of blood and blue paint.

But these manifold mistakes in depicting the whale are not so very surprising after all. Consider! Most of the scientific drawings have been taken from the stranded fish; and these are about as correct as a drawing of a wrecked ship, with broken back, would correctly represent the noble animal itself in all its undashed pride of hull and spars. Though elephants have stood for their full-lengths, the living Leviathan has never yet fairly floated himself for his portrait. The living whale, in his full majesty and significance, is only to be seen at sea in unfathomable waters; and afloat the vast bulk of him is out of sight, like a launched line-of-battle ship; and out of that element it is a thing eternally impossible for mortal man to hoist him bodily into the air, so as to preserve all his mighty swells and undulations. And, not to speak of the highly presumable difference of contour between a young sucking whale and a full-grown Platonian Leviathan; yet, even in the case of one of those young sucking whales hoisted to a ship’s deck, such is then the outlandish, eel-like, limbered, varying shape of him, that his precise expression the devil himself could not catch.

But it may be fancied, that from the naked skeleton of the stranded whale, accurate hints may be derived touching his true form. Not at all. For it is one of the more curious things about this Leviathan, that his skeleton gives very little idea of his general shape. Though Jeremy Bentham’s skeleton, which hangs for candelabra in the library of one of his executors, correctly conveys the idea of a burly-browed utilitarian old gentleman, with all Jeremy’s other leading personal characteristics; yet nothing of this kind could be inferred from any leviathan’s articulated bones. In fact, as the great Hunter says, the mere skeleton of the whale bears the same relation to the fully invested and padded animal as the insect does to the chrysalis that so roundingly envelopes it. This peculiarity is strikingly evinced in the head, as in some part of this book will be incidentally shown. It is also very curiously displayed in the side fin, the bones of which almost exactly answer to the bones of the human hand, minus only the thumb. This fin has four regular bone-fingers, the index, middle, ring, and little finger. But all these are permanently lodged in their fleshy covering, as the human fingers in an artificial covering. “However recklessly the whale may sometimes serve us,” said humorous Stubb one day, “he can never be truly said to handle us without mittens.”

For all these reasons, then, any way you may look at it, you must needs conclude that the great Leviathan is that one creature in the world which must remain unpainted to the last. True, one portrait may hit the mark much nearer than another, but none can hit it with any very considerable degree of exactness. So there is no earthly way of finding out precisely what the whale really looks like. And the only mode in which you can derive even a tolerable idea of his living contour, is by going a whaling yourself; but by so doing, you run no small risk of being eternally stove and sunk by him. Wherefore, it seems to me you had best not be too fastidious in your curiosity touching this Leviathan.






CHAPTER 56. Of the Less Erroneous Pictures of Whales, and the True Pictures of Whaling Scenes.
In connexion with the monstrous pictures of whales, I am strongly tempted here to enter upon those still more monstrous stories of them which are to be found in certain books, both ancient and modern, especially in Pliny, Purchas, Hackluyt, Harris, Cuvier, etc. But I pass that matter by.

I know of only four published outlines of the great Sperm Whale; Colnett’s, Huggins’s, Frederick Cuvier’s, and Beale’s. In the previous chapter Colnett and Cuvier have been referred to. Huggins’s is far better than theirs; but, by great odds, Beale’s is the best. All Beale’s drawings of this whale are good, excepting the middle figure in the picture of three whales in various attitudes, capping his second chapter. His frontispiece, boats attacking Sperm Whales, though no doubt calculated to excite the civil scepticism of some parlor men, is admirably correct and life-like in its general effect. Some of the Sperm Whale drawings in J. Ross Browne are pretty correct in contour; but they are wretchedly engraved. That is not his fault though.

Of the Right Whale, the best outline pictures are in Scoresby; but they are drawn on too small a scale to convey a desirable impression. He has but one picture of whaling scenes, and this is a sad deficiency, because it is by such pictures only, when at all well done, that you can derive anything like a truthful idea of the living whale as seen by his living hunters.

But, taken for all in all, by far the finest, though in some details not the most correct, presentations of whales and whaling scenes to be anywhere found, are two large French engravings, well executed, and taken from paintings by one Garnery. Respectively, they represent attacks on the Sperm and Right Whale. In the first engraving a noble Sperm Whale is depicted in full majesty of might, just risen beneath the boat from the profundities of the ocean, and bearing high in the air upon his back the terrific wreck of the stoven planks. The prow of the boat is partially unbroken, and is drawn just balancing upon the monster’s spine; and standing in that prow, for that one single incomputable flash of time, you behold an oarsman, half shrouded by the incensed boiling spout of the whale, and in the act of leaping, as if from a precipice. The action of the whole thing is wonderfully good and true. The half-emptied line-tub floats on the whitened sea; the wooden poles of the spilled harpoons obliquely bob in it; the heads of the swimming crew are scattered about the whale in contrasting expressions of affright; while in the black stormy distance the ship is bearing down upon the scene. Serious fault might be found with the anatomical details of this whale, but let that pass; since, for the life of me, I could not draw so good a one.

In the second engraving, the boat is in the act of drawing alongside the barnacled flank of a large running Right Whale, that rolls his black weedy bulk in the sea like some mossy rock-slide from the Patagonian cliffs. His jets are erect, full, and black like soot; so that from so abounding a smoke in the chimney, you would think there must be a brave supper cooking in the great bowels below. Sea fowls are pecking at the small crabs, shell-fish, and other sea candies and maccaroni, which the Right Whale sometimes carries on his pestilent back. And all the while the thick-lipped leviathan is rushing through the deep, leaving tons of tumultuous white curds in his wake, and causing the slight boat to rock in the swells like a skiff caught nigh the paddle-wheels of an ocean steamer. Thus, the foreground is all raging commotion; but behind, in admirable artistic contrast, is the glassy level of a sea becalmed, the drooping unstarched sails of the powerless ship, and the inert mass of a dead whale, a conquered fortress, with the flag of capture lazily hanging from the whale-pole inserted into his spout-hole.

Who Garnery the painter is, or was, I know not. But my life for it he was either practically conversant with his subject, or else marvellously tutored by some experienced whaleman. The French are the lads for painting action. Go and gaze upon all the paintings of Europe, and where will you find such a gallery of living and breathing commotion on canvas, as in that triumphal hall at Versailles; where the beholder fights his way, pell-mell, through the consecutive great battles of France; where every sword seems a flash of the Northern Lights, and the successive armed kings and Emperors dash by, like a charge of crowned centaurs? Not wholly unworthy of a place in that gallery, are these sea battle-pieces of Garnery.

The natural aptitude of the French for seizing the picturesqueness of things seems to be peculiarly evinced in what paintings and engravings they have of their whaling scenes. With not one tenth of England’s experience in the fishery, and not the thousandth part of that of the Americans, they have nevertheless furnished both nations with the only finished sketches at all capable of conveying the real spirit of the whale hunt. For the most part, the English and American whale draughtsmen seem entirely content with presenting the mechanical outline of things, such as the vacant profile of the whale; which, so far as picturesqueness of effect is concerned, is about tantamount to sketching the profile of a pyramid. Even Scoresby, the justly renowned Right whaleman, after giving us a stiff full length of the Greenland whale, and three or four delicate miniatures of narwhales and porpoises, treats us to a series of classical engravings of boat hooks, chopping knives, and grapnels; and with the microscopic diligence of a Leuwenhoeck submits to the inspection of a shivering world ninety-six fac-similes of magnified Arctic snow crystals. I mean no disparagement to the excellent voyager (I honor him for a veteran), but in so important a matter it was certainly an oversight not to have procured for every crystal a sworn affidavit taken before a Greenland Justice of the Peace.

In addition to those fine engravings from Garnery, there are two other French engravings worthy of note, by some one who subscribes himself “H. Durand.” One of them, though not precisely adapted to our present purpose, nevertheless deserves mention on other accounts. It is a quiet noon-scene among the isles of the Pacific; a French whaler anchored, inshore, in a calm, and lazily taking water on board; the loosened sails of the ship, and the long leaves of the palms in the background, both drooping together in the breezeless air. The effect is very fine, when considered with reference to its presenting the hardy fishermen under one of their few aspects of oriental repose. The other engraving is quite a different affair: the ship hove-to upon the open sea, and in the very heart of the Leviathanic life, with a Right Whale alongside; the vessel (in the act of cutting-in) hove over to the monster as if to a quay; and a boat, hurriedly pushing off from this scene of activity, is about giving chase to whales in the distance. The harpoons and lances lie levelled for use; three oarsmen are just setting the mast in its hole; while from a sudden roll of the sea, the little craft stands half-erect out of the water, like a rearing horse. From the ship, the smoke of the torments of the boiling whale is going up like the smoke over a village of smithies; and to windward, a black cloud, rising up with earnest of squalls and rains, seems to quicken the activity of the excited seamen.






CHAPTER 57. Of Whales in Paint; in Teeth; in Wood; in Sheet-Iron; in Stone; in Mountains; in Stars.
On Tower-hill, as you go down to the London docks, you may have seen a crippled beggar (or kedger, as the sailors say) holding a painted board before him, representing the tragic scene in which he lost his leg. There are three whales and three boats; and one of the boats (presumed to contain the missing leg in all its original integrity) is being crunched by the jaws of the foremost whale. Any time these ten years, they tell me, has that man held up that picture, and exhibited that stump to an incredulous world. But the time of his justification has now come. His three whales are as good whales as were ever published in Wapping, at any rate; and his stump as unquestionable a stump as any you will find in the western clearings. But, though for ever mounted on that stump, never a stump-speech does the poor whaleman make; but, with downcast eyes, stands ruefully contemplating his own amputation.

Throughout the Pacific, and also in Nantucket, and New Bedford, and Sag Harbor, you will come across lively sketches of whales and whaling-scenes, graven by the fishermen themselves on Sperm Whale-teeth, or ladies’ busks wrought out of the Right Whale-bone, and other like skrimshander articles, as the whalemen call the numerous little ingenious contrivances they elaborately carve out of the rough material, in their hours of ocean leisure. Some of them have little boxes of dentistical-looking implements, specially intended for the skrimshandering business. But, in general, they toil with their jack-knives alone; and, with that almost omnipotent tool of the sailor, they will turn you out anything you please, in the way of a mariner’s fancy.

Long exile from Christendom and civilization inevitably restores a man to that condition in which God placed him, i.e. what is called savagery. Your true whale-hunter is as much a savage as an Iroquois. I myself am a savage, owning no allegiance but to the King of the Cannibals; and ready at any moment to rebel against him.

Now, one of the peculiar characteristics of the savage in his domestic hours, is his wonderful patience of industry. An ancient Hawaiian war-club or spear-paddle, in its full multiplicity and elaboration of carving, is as great a trophy of human perseverance as a Latin lexicon. For, with but a bit of broken sea-shell or a shark’s tooth, that miraculous intricacy of wooden net-work has been achieved; and it has cost steady years of steady application.

As with the Hawaiian savage, so with the white sailor-savage. With the same marvellous patience, and with the same single shark’s tooth, of his one poor jack-knife, he will carve you a bit of bone sculpture, not quite as workmanlike, but as close packed in its maziness of design, as the Greek savage, Achilles’s shield; and full of barbaric spirit and suggestiveness, as the prints of that fine old Dutch savage, Albert Durer.

Wooden whales, or whales cut in profile out of the small dark slabs of the noble South Sea war-wood, are frequently met with in the forecastles of American whalers. Some of them are done with much accuracy.

At some old gable-roofed country houses you will see brass whales hung by the tail for knockers to the road-side door. When the porter is sleepy, the anvil-headed whale would be best. But these knocking whales are seldom remarkable as faithful essays. On the spires of some old-fashioned churches you will see sheet-iron whales placed there for weather-cocks; but they are so elevated, and besides that are to all intents and purposes so labelled with “Hands off!” you cannot examine them closely enough to decide upon their merit.

In bony, ribby regions of the earth, where at the base of high broken cliffs masses of rock lie strewn in fantastic groupings upon the plain, you will often discover images as of the petrified forms of the Leviathan partly merged in grass, which of a windy day breaks against them in a surf of green surges.

Then, again, in mountainous countries where the traveller is continually girdled by amphitheatrical heights; here and there from some lucky point of view you will catch passing glimpses of the profiles of whales defined along the undulating ridges. But you must be a thorough whaleman, to see these sights; and not only that, but if you wish to return to such a sight again, you must be sure and take the exact intersecting latitude and longitude of your first stand-point, else so chance-like are such observations of the hills, that your precise, previous stand-point would require a laborious re-discovery; like the Soloma Islands, which still remain incognita, though once high-ruffed Mendanna trod them and old Figuera chronicled them.

Nor when expandingly lifted by your subject, can you fail to trace out great whales in the starry heavens, and boats in pursuit of them; as when long filled with thoughts of war the Eastern nations saw armies locked in battle among the clouds. Thus at the North have I chased Leviathan round and round the Pole with the revolutions of the bright points that first defined him to me. And beneath the effulgent Antarctic skies I have boarded the Argo-Navis, and joined the chase against the starry Cetus far beyond the utmost stretch of Hydrus and the Flying Fish.

With a frigate’s anchors for my bridle-bitts and fasces of harpoons for spurs, would I could mount that whale and leap the topmost skies, to see whether the fabled heavens with all their countless tents really lie encamped beyond my mortal sight!






CHAPTER 58. Brit.
Steering north-eastward from the Crozetts, we fell in with vast meadows of brit, the minute, yellow substance, upon which the Right Whale largely feeds. For leagues and leagues it undulated round us, so that we seemed to be sailing through boundless fields of ripe and golden wheat.

On the second day, numbers of Right Whales were seen, who, secure from the attack of a Sperm Whaler like the Pequod, with open jaws sluggishly swam through the brit, which, adhering to the fringing fibres of that wondrous Venetian blind in their mouths, was in that manner separated from the water that escaped at the lip.

As morning mowers, who side by side slowly and seethingly advance their scythes through the long wet grass of marshy meads; even so these monsters swam, making a strange, grassy, cutting sound; and leaving behind them endless swaths of blue upon the yellow sea.*

*That part of the sea known among whalemen as the “Brazil Banks” does not bear that name as the Banks of Newfoundland do, because of there being shallows and soundings there, but because of this remarkable meadow-like appearance, caused by the vast drifts of brit continually floating in those latitudes, where the Right Whale is often chased.

But it was only the sound they made as they parted the brit which at all reminded one of mowers. Seen from the mast-heads, especially when they paused and were stationary for a while, their vast black forms looked more like lifeless masses of rock than anything else. And as in the great hunting countries of India, the stranger at a distance will sometimes pass on the plains recumbent elephants without knowing them to be such, taking them for bare, blackened elevations of the soil; even so, often, with him, who for the first time beholds this species of the leviathans of the sea. And even when recognised at last, their immense magnitude renders it very hard really to believe that such bulky masses of overgrowth can possibly be instinct, in all parts, with the same sort of life that lives in a dog or a horse.

Indeed, in other respects, you can hardly regard any creatures of the deep with the same feelings that you do those of the shore. For though some old naturalists have maintained that all creatures of the land are of their kind in the sea; and though taking a broad general view of the thing, this may very well be; yet coming to specialties, where, for example, does the ocean furnish any fish that in disposition answers to the sagacious kindness of the dog? The accursed shark alone can in any generic respect be said to bear comparative analogy to him.

But though, to landsmen in general, the native inhabitants of the seas have ever been regarded with emotions unspeakably unsocial and repelling; though we know the sea to be an everlasting terra incognita, so that Columbus sailed over numberless unknown worlds to discover his one superficial western one; though, by vast odds, the most terrific of all mortal disasters have immemorially and indiscriminately befallen tens and hundreds of thousands of those who have gone upon the waters; though but a moment’s consideration will teach, that however baby man may brag of his science and skill, and however much, in a flattering future, that science and skill may augment; yet for ever and for ever, to the crack of doom, the sea will insult and murder him, and pulverize the stateliest, stiffest frigate he can make; nevertheless, by the continual repetition of these very impressions, man has lost that sense of the full awfulness of the sea which aboriginally belongs to it.

The first boat we read of, floated on an ocean, that with Portuguese vengeance had whelmed a whole world without leaving so much as a widow. That same ocean rolls now; that same ocean destroyed the wrecked ships of last year. Yea, foolish mortals, Noah’s flood is not yet subsided; two thirds of the fair world it yet covers.

Wherein differ the sea and the land, that a miracle upon one is not a miracle upon the other? Preternatural terrors rested upon the Hebrews, when under the feet of Korah and his company the live ground opened and swallowed them up for ever; yet not a modern sun ever sets, but in precisely the same manner the live sea swallows up ships and crews.

But not only is the sea such a foe to man who is an alien to it, but it is also a fiend to its own off-spring; worse than the Persian host who murdered his own guests; sparing not the creatures which itself hath spawned. Like a savage tigress that tossing in the jungle overlays her own cubs, so the sea dashes even the mightiest whales against the rocks, and leaves them there side by side with the split wrecks of ships. No mercy, no power but its own controls it. Panting and snorting like a mad battle steed that has lost its rider, the masterless ocean overruns the globe.

Consider the subtleness of the sea; how its most dreaded creatures glide under water, unapparent for the most part, and treacherously hidden beneath the loveliest tints of azure. Consider also the devilish brilliance and beauty of many of its most remorseless tribes, as the dainty embellished shape of many species of sharks. Consider, once more, the universal cannibalism of the sea; all whose creatures prey upon each other, carrying on eternal war since the world began.

Consider all this; and then turn to this green, gentle, and most docile earth; consider them both, the sea and the land; and do you not find a strange analogy to something in yourself? For as this appalling ocean surrounds the verdant land, so in the soul of man there lies one insular Tahiti, full of peace and joy, but encompassed by all the horrors of the half known life. God keep thee! Push not off from that isle, thou canst never return!






CHAPTER 59. Squid.
Slowly wading through the meadows of brit, the Pequod still held on her way north-eastward towards the island of Java; a gentle air impelling her keel, so that in the surrounding serenity her three tall tapering masts mildly waved to that languid breeze, as three mild palms on a plain. And still, at wide intervals in the silvery night, the lonely, alluring jet would be seen.

But one transparent blue morning, when a stillness almost preternatural spread over the sea, however unattended with any stagnant calm; when the long burnished sun-glade on the waters seemed a golden finger laid across them, enjoining some secrecy; when the slippered waves whispered together as they softly ran on; in this profound hush of the visible sphere a strange spectre was seen by Daggoo from the main-mast-head.

In the distance, a great white mass lazily rose, and rising higher and higher, and disentangling itself from the azure, at last gleamed before our prow like a snow-slide, new slid from the hills. Thus glistening for a moment, as slowly it subsided, and sank. Then once more arose, and silently gleamed. It seemed not a whale; and yet is this Moby Dick? thought Daggoo. Again the phantom went down, but on re-appearing once more, with a stiletto-like cry that startled every man from his nod, the negro yelled out—“There! there again! there she breaches! right ahead! The White Whale, the White Whale!”

Upon this, the seamen rushed to the yard-arms, as in swarming-time the bees rush to the boughs. Bare-headed in the sultry sun, Ahab stood on the bowsprit, and with one hand pushed far behind in readiness to wave his orders to the helmsman, cast his eager glance in the direction indicated aloft by the outstretched motionless arm of Daggoo.

Whether the flitting attendance of the one still and solitary jet had gradually worked upon Ahab, so that he was now prepared to connect the ideas of mildness and repose with the first sight of the particular whale he pursued; however this was, or whether his eagerness betrayed him; whichever way it might have been, no sooner did he distinctly perceive the white mass, than with a quick intensity he instantly gave orders for lowering.

The four boats were soon on the water; Ahab’s in advance, and all swiftly pulling towards their prey. Soon it went down, and while, with oars suspended, we were awaiting its reappearance, lo! in the same spot where it sank, once more it slowly rose. Almost forgetting for the moment all thoughts of Moby Dick, we now gazed at the most wondrous phenomenon which the secret seas have hitherto revealed to mankind. A vast pulpy mass, furlongs in length and breadth, of a glancing cream-colour, lay floating on the water, innumerable long arms radiating from its centre, and curling and twisting like a nest of anacondas, as if blindly to clutch at any hapless object within reach. No perceptible face or front did it have; no conceivable token of either sensation or instinct; but undulated there on the billows, an unearthly, formless, chance-like apparition of life.

As with a low sucking sound it slowly disappeared again, Starbuck still gazing at the agitated waters where it had sunk, with a wild voice exclaimed—“Almost rather had I seen Moby Dick and fought him, than to have seen thee, thou white ghost!”

“What was it, Sir?” said Flask.

“The great live squid, which, they say, few whale-ships ever beheld, and returned to their ports to tell of it.”

But Ahab said nothing; turning his boat, he sailed back to the vessel; the rest as silently following.

Whatever superstitions the sperm whalemen in general have connected with the sight of this object, certain it is, that a glimpse of it being so very unusual, that circumstance has gone far to invest it with portentousness. So rarely is it beheld, that though one and all of them declare it to be the largest animated thing in the ocean, yet very few of them have any but the most vague ideas concerning its true nature and form; notwithstanding, they believe it to furnish to the sperm whale his only food. For though other species of whales find their food above water, and may be seen by man in the act of feeding, the spermaceti whale obtains his whole food in unknown zones below the surface; and only by inference is it that any one can tell of what, precisely, that food consists. At times, when closely pursued, he will disgorge what are supposed to be the detached arms of the squid; some of them thus exhibited exceeding twenty and thirty feet in length. They fancy that the monster to which these arms belonged ordinarily clings by them to the bed of the ocean; and that the sperm whale, unlike other species, is supplied with teeth in order to attack and tear it.

There seems some ground to imagine that the great Kraken of Bishop Pontoppodan may ultimately resolve itself into Squid. The manner in which the Bishop describes it, as alternately rising and sinking, with some other particulars he narrates, in all this the two correspond. But much abatement is necessary with respect to the incredible bulk he assigns it.

By some naturalists who have vaguely heard rumors of the mysterious creature, here spoken of, it is included among the class of cuttle-fish, to which, indeed, in certain external respects it would seem to belong, but only as the Anak of the tribe.






CHAPTER 60. The Line.
With reference to the whaling scene shortly to be described, as well as for the better understanding of all similar scenes elsewhere presented, I have here to speak of the magical, sometimes horrible whale-line.

The line originally used in the fishery was of the best hemp, slightly vapored with tar, not impregnated with it, as in the case of ordinary ropes; for while tar, as ordinarily used, makes the hemp more pliable to the rope-maker, and also renders the rope itself more convenient to the sailor for common ship use; yet, not only would the ordinary quantity too much stiffen the whale-line for the close coiling to which it must be subjected; but as most seamen are beginning to learn, tar in general by no means adds to the rope’s durability or strength, however much it may give it compactness and gloss.

Of late years the Manilla rope has in the American fishery almost entirely superseded hemp as a material for whale-lines; for, though not so durable as hemp, it is stronger, and far more soft and elastic; and I will add (since there is an æsthetics in all things), is much more handsome and becoming to the boat, than hemp. Hemp is a dusky, dark fellow, a sort of Indian; but Manilla is as a golden-haired Circassian to behold.

The whale-line is only two-thirds of an inch in thickness. At first sight, you would not think it so strong as it really is. By experiment its one and fifty yarns will each suspend a weight of one hundred and twenty pounds; so that the whole rope will bear a strain nearly equal to three tons. In length, the common sperm whale-line measures something over two hundred fathoms. Towards the stern of the boat it is spirally coiled away in the tub, not like the worm-pipe of a still though, but so as to form one round, cheese-shaped mass of densely bedded “sheaves,” or layers of concentric spiralizations, without any hollow but the “heart,” or minute vertical tube formed at the axis of the cheese. As the least tangle or kink in the coiling would, in running out, infallibly take somebody’s arm, leg, or entire body off, the utmost precaution is used in stowing the line in its tub. Some harpooneers will consume almost an entire morning in this business, carrying the line high aloft and then reeving it downwards through a block towards the tub, so as in the act of coiling to free it from all possible wrinkles and twists.

In the English boats two tubs are used instead of one; the same line being continuously coiled in both tubs. There is some advantage in this; because these twin-tubs being so small they fit more readily into the boat, and do not strain it so much; whereas, the American tub, nearly three feet in diameter and of proportionate depth, makes a rather bulky freight for a craft whose planks are but one half-inch in thickness; for the bottom of the whale-boat is like critical ice, which will bear up a considerable distributed weight, but not very much of a concentrated one. When the painted canvas cover is clapped on the American line-tub, the boat looks as if it were pulling off with a prodigious great wedding-cake to present to the whales.

Both ends of the line are exposed; the lower end terminating in an eye-splice or loop coming up from the bottom against the side of the tub, and hanging over its edge completely disengaged from everything. This arrangement of the lower end is necessary on two accounts. First: In order to facilitate the fastening to it of an additional line from a neighboring boat, in case the stricken whale should sound so deep as to threaten to carry off the entire line originally attached to the harpoon. In these instances, the whale of course is shifted like a mug of ale, as it were, from the one boat to the other; though the first boat always hovers at hand to assist its consort. Second: This arrangement is indispensable for common safety’s sake; for were the lower end of the line in any way attached to the boat, and were the whale then to run the line out to the end almost in a single, smoking minute as he sometimes does, he would not stop there, for the doomed boat would infallibly be dragged down after him into the profundity of the sea; and in that case no town-crier would ever find her again.

Before lowering the boat for the chase, the upper end of the line is taken aft from the tub, and passing round the loggerhead there, is again carried forward the entire length of the boat, resting crosswise upon the loom or handle of every man’s oar, so that it jogs against his wrist in rowing; and also passing between the men, as they alternately sit at the opposite gunwales, to the leaded chocks or grooves in the extreme pointed prow of the boat, where a wooden pin or skewer the size of a common quill, prevents it from slipping out. From the chocks it hangs in a slight festoon over the bows, and is then passed inside the boat again; and some ten or twenty fathoms (called box-line) being coiled upon the box in the bows, it continues its way to the gunwale still a little further aft, and is then attached to the short-warp—the rope which is immediately connected with the harpoon; but previous to that connexion, the short-warp goes through sundry mystifications too tedious to detail.

Thus the whale-line folds the whole boat in its complicated coils, twisting and writhing around it in almost every direction. All the oarsmen are involved in its perilous contortions; so that to the timid eye of the landsman, they seem as Indian jugglers, with the deadliest snakes sportively festooning their limbs. Nor can any son of mortal woman, for the first time, seat himself amid those hempen intricacies, and while straining his utmost at the oar, bethink him that at any unknown instant the harpoon may be darted, and all these horrible contortions be put in play like ringed lightnings; he cannot be thus circumstanced without a shudder that makes the very marrow in his bones to quiver in him like a shaken jelly. Yet habit—strange thing! what cannot habit accomplish?—Gayer sallies, more merry mirth, better jokes, and brighter repartees, you never heard over your mahogany, than you will hear over the half-inch white cedar of the whale-boat, when thus hung in hangman’s nooses; and, like the six burghers of Calais before King Edward, the six men composing the crew pull into the jaws of death, with a halter around every neck, as you may say.

Perhaps a very little thought will now enable you to account for those repeated whaling disasters—some few of which are casually chronicled—of this man or that man being taken out of the boat by the line, and lost. For, when the line is darting out, to be seated then in the boat, is like being seated in the midst of the manifold whizzings of a steam-engine in full play, when every flying beam, and shaft, and wheel, is grazing you. It is worse; for you cannot sit motionless in the heart of these perils, because the boat is rocking like a cradle, and you are pitched one way and the other, without the slightest warning; and only by a certain self-adjusting buoyancy and simultaneousness of volition and action, can you escape being made a Mazeppa of, and run away with where the all-seeing sun himself could never pierce you out.

Again: as the profound calm which only apparently precedes and prophesies of the storm, is perhaps more awful than the storm itself; for, indeed, the calm is but the wrapper and envelope of the storm; and contains it in itself, as the seemingly harmless rifle holds the fatal powder, and the ball, and the explosion; so the graceful repose of the line, as it silently serpentines about the oarsmen before being brought into actual play—this is a thing which carries more of true terror than any other aspect of this dangerous affair. But why say more? All men live enveloped in whale-lines. All are born with halters round their necks; but it is only when caught in the swift, sudden turn of death, that mortals realize the silent, subtle, ever-present perils of life. And if you be a philosopher, though seated in the whale-boat, you would not at heart feel one whit more of terror, than though seated before your evening fire with a poker, and not a harpoon, by your side.






CHAPTER 61. Stubb Kills a Whale.
If to Starbuck the apparition of the Squid was a thing of portents, to Queequeg it was quite a different object.

“When you see him ’quid,” said the savage, honing his harpoon in the bow of his hoisted boat, “then you quick see him ’parm whale.”

The next day was exceedingly still and sultry, and with nothing special to engage them, the Pequod’s crew could hardly resist the spell of sleep induced by such a vacant sea. For this part of the Indian Ocean through which we then were voyaging is not what whalemen call a lively ground; that is, it affords fewer glimpses of porpoises, dolphins, flying-fish, and other vivacious denizens of more stirring waters, than those off the Rio de la Plata, or the in-shore ground off Peru.

It was my turn to stand at the foremast-head; and with my shoulders leaning against the slackened royal shrouds, to and fro I idly swayed in what seemed an enchanted air. No resolution could withstand it; in that dreamy mood losing all consciousness, at last my soul went out of my body; though my body still continued to sway as a pendulum will, long after the power which first moved it is withdrawn.

Ere forgetfulness altogether came over me, I had noticed that the seamen at the main and mizzen-mast-heads were already drowsy. So that at last all three of us lifelessly swung from the spars, and for every swing that we made there was a nod from below from the slumbering helmsman. The waves, too, nodded their indolent crests; and across the wide trance of the sea, east nodded to west, and the sun over all.

Suddenly bubbles seemed bursting beneath my closed eyes; like vices my hands grasped the shrouds; some invisible, gracious agency preserved me; with a shock I came back to life. And lo! close under our lee, not forty fathoms off, a gigantic Sperm Whale lay rolling in the water like the capsized hull of a frigate, his broad, glossy back, of an Ethiopian hue, glistening in the sun’s rays like a mirror. But lazily undulating in the trough of the sea, and ever and anon tranquilly spouting his vapory jet, the whale looked like a portly burgher smoking his pipe of a warm afternoon. But that pipe, poor whale, was thy last. As if struck by some enchanter’s wand, the sleepy ship and every sleeper in it all at once started into wakefulness; and more than a score of voices from all parts of the vessel, simultaneously with the three notes from aloft, shouted forth the accustomed cry, as the great fish slowly and regularly spouted the sparkling brine into the air.

“Clear away the boats! Luff!” cried Ahab. And obeying his own order, he dashed the helm down before the helmsman could handle the spokes.

The sudden exclamations of the crew must have alarmed the whale; and ere the boats were down, majestically turning, he swam away to the leeward, but with such a steady tranquillity, and making so few ripples as he swam, that thinking after all he might not as yet be alarmed, Ahab gave orders that not an oar should be used, and no man must speak but in whispers. So seated like Ontario Indians on the gunwales of the boats, we swiftly but silently paddled along; the calm not admitting of the noiseless sails being set. Presently, as we thus glided in chase, the monster perpendicularly flitted his tail forty feet into the air, and then sank out of sight like a tower swallowed up.

“There go flukes!” was the cry, an announcement immediately followed by Stubb’s producing his match and igniting his pipe, for now a respite was granted. After the full interval of his sounding had elapsed, the whale rose again, and being now in advance of the smoker’s boat, and much nearer to it than to any of the others, Stubb counted upon the honor of the capture. It was obvious, now, that the whale had at length become aware of his pursuers. All silence of cautiousness was therefore no longer of use. Paddles were dropped, and oars came loudly into play. And still puffing at his pipe, Stubb cheered on his crew to the assault.

Yes, a mighty change had come over the fish. All alive to his jeopardy, he was going “head out”; that part obliquely projecting from the mad yeast which he brewed.*

*It will be seen in some other place of what a very light substance the entire interior of the sperm whale’s enormous head consists. Though apparently the most massive, it is by far the most buoyant part about him. So that with ease he elevates it in the air, and invariably does so when going at his utmost speed. Besides, such is the breadth of the upper part of the front of his head, and such the tapering cut-water formation of the lower part, that by obliquely elevating his head, he thereby may be said to transform himself from a bluff-bowed sluggish galliot into a sharppointed New York pilot-boat.

“Start her, start her, my men! Don’t hurry yourselves; take plenty of time—but start her; start her like thunder-claps, that’s all,” cried Stubb, spluttering out the smoke as he spoke. “Start her, now; give ’em the long and strong stroke, Tashtego. Start her, Tash, my boy—start her, all; but keep cool, keep cool—cucumbers is the word—easy, easy—only start her like grim death and grinning devils, and raise the buried dead perpendicular out of their graves, boys—that’s all. Start her!”

“Woo-hoo! Wa-hee!” screamed the Gay-Header in reply, raising some old war-whoop to the skies; as every oarsman in the strained boat involuntarily bounced forward with the one tremendous leading stroke which the eager Indian gave.

But his wild screams were answered by others quite as wild. “Kee-hee! Kee-hee!” yelled Daggoo, straining forwards and backwards on his seat, like a pacing tiger in his cage.

“Ka-la! Koo-loo!” howled Queequeg, as if smacking his lips over a mouthful of Grenadier’s steak. And thus with oars and yells the keels cut the sea. Meanwhile, Stubb retaining his place in the van, still encouraged his men to the onset, all the while puffing the smoke from his mouth. Like desperadoes they tugged and they strained, till the welcome cry was heard—“Stand up, Tashtego!—give it to him!” The harpoon was hurled. “Stern all!” The oarsmen backed water; the same moment something went hot and hissing along every one of their wrists. It was the magical line. An instant before, Stubb had swiftly caught two additional turns with it round the loggerhead, whence, by reason of its increased rapid circlings, a hempen blue smoke now jetted up and mingled with the steady fumes from his pipe. As the line passed round and round the loggerhead; so also, just before reaching that point, it blisteringly passed through and through both of Stubb’s hands, from which the hand-cloths, or squares of quilted canvas sometimes worn at these times, had accidentally dropped. It was like holding an enemy’s sharp two-edged sword by the blade, and that enemy all the time striving to wrest it out of your clutch.

“Wet the line! wet the line!” cried Stubb to the tub oarsman (him seated by the tub) who, snatching off his hat, dashed sea-water into it.* More turns were taken, so that the line began holding its place. The boat now flew through the boiling water like a shark all fins. Stubb and Tashtego here changed places—stem for stern—a staggering business truly in that rocking commotion.

*Partly to show the indispensableness of this act, it may here be stated, that, in the old Dutch fishery, a mop was used to dash the running line with water; in many other ships, a wooden piggin, or bailer, is set apart for that purpose. Your hat, however, is the most convenient.

From the vibrating line extending the entire length of the upper part of the boat, and from its now being more tight than a harpstring, you would have thought the craft had two keels—one cleaving the water, the other the air—as the boat churned on through both opposing elements at once. A continual cascade played at the bows; a ceaseless whirling eddy in her wake; and, at the slightest motion from within, even but of a little finger, the vibrating, cracking craft canted over her spasmodic gunwale into the sea. Thus they rushed; each man with might and main clinging to his seat, to prevent being tossed to the foam; and the tall form of Tashtego at the steering oar crouching almost double, in order to bring down his centre of gravity. Whole Atlantics and Pacifics seemed passed as they shot on their way, till at length the whale somewhat slackened his flight.

“Haul in—haul in!” cried Stubb to the bowsman! and, facing round towards the whale, all hands began pulling the boat up to him, while yet the boat was being towed on. Soon ranging up by his flank, Stubb, firmly planting his knee in the clumsy cleat, darted dart after dart into the flying fish; at the word of command, the boat alternately sterning out of the way of the whale’s horrible wallow, and then ranging up for another fling.

The red tide now poured from all sides of the monster like brooks down a hill. His tormented body rolled not in brine but in blood, which bubbled and seethed for furlongs behind in their wake. The slanting sun playing upon this crimson pond in the sea, sent back its reflection into every face, so that they all glowed to each other like red men. And all the while, jet after jet of white smoke was agonizingly shot from the spiracle of the whale, and vehement puff after puff from the mouth of the excited headsman; as at every dart, hauling in upon his crooked lance (by the line attached to it), Stubb straightened it again and again, by a few rapid blows against the gunwale, then again and again sent it into the whale.

“Pull up—pull up!” he now cried to the bowsman, as the waning whale relaxed in his wrath. “Pull up!—close to!” and the boat ranged along the fish’s flank. When reaching far over the bow, Stubb slowly churned his long sharp lance into the fish, and kept it there, carefully churning and churning, as if cautiously seeking to feel after some gold watch that the whale might have swallowed, and which he was fearful of breaking ere he could hook it out. But that gold watch he sought was the innermost life of the fish. And now it is struck; for, starting from his trance into that unspeakable thing called his “flurry,” the monster horribly wallowed in his blood, overwrapped himself in impenetrable, mad, boiling spray, so that the imperilled craft, instantly dropping astern, had much ado blindly to struggle out from that phrensied twilight into the clear air of the day.

And now abating in his flurry, the whale once more rolled out into view; surging from side to side; spasmodically dilating and contracting his spout-hole, with sharp, cracking, agonized respirations. At last, gush after gush of clotted red gore, as if it had been the purple lees of red wine, shot into the frighted air; and falling back again, ran dripping down his motionless flanks into the sea. His heart had burst!

“He’s dead, Mr. Stubb,” said Daggoo.

“Yes; both pipes smoked out!” and withdrawing his own from his mouth, Stubb scattered the dead ashes over the water; and, for a moment, stood thoughtfully eyeing the vast corpse he had made.






CHAPTER 62. The Dart.
A word concerning an incident in the last chapter.

According to the invariable usage of the fishery, the whale-boat pushes off from the ship, with the headsman or whale-killer as temporary steersman, and the harpooneer or whale-fastener pulling the foremost oar, the one known as the harpooneer-oar. Now it needs a strong, nervous arm to strike the first iron into the fish; for often, in what is called a long dart, the heavy implement has to be flung to the distance of twenty or thirty feet. But however prolonged and exhausting the chase, the harpooneer is expected to pull his oar meanwhile to the uttermost; indeed, he is expected to set an example of superhuman activity to the rest, not only by incredible rowing, but by repeated loud and intrepid exclamations; and what it is to keep shouting at the top of one’s compass, while all the other muscles are strained and half started—what that is none know but those who have tried it. For one, I cannot bawl very heartily and work very recklessly at one and the same time. In this straining, bawling state, then, with his back to the fish, all at once the exhausted harpooneer hears the exciting cry—“Stand up, and give it to him!” He now has to drop and secure his oar, turn round on his centre half way, seize his harpoon from the crotch, and with what little strength may remain, he essays to pitch it somehow into the whale. No wonder, taking the whole fleet of whalemen in a body, that out of fifty fair chances for a dart, not five are successful; no wonder that so many hapless harpooneers are madly cursed and disrated; no wonder that some of them actually burst their blood-vessels in the boat; no wonder that some sperm whalemen are absent four years with four barrels; no wonder that to many ship owners, whaling is but a losing concern; for it is the harpooneer that makes the voyage, and if you take the breath out of his body how can you expect to find it there when most wanted!

Again, if the dart be successful, then at the second critical instant, that is, when the whale starts to run, the boatheader and harpooneer likewise start to running fore and aft, to the imminent jeopardy of themselves and every one else. It is then they change places; and the headsman, the chief officer of the little craft, takes his proper station in the bows of the boat.

Now, I care not who maintains the contrary, but all this is both foolish and unnecessary. The headsman should stay in the bows from first to last; he should both dart the harpoon and the lance, and no rowing whatever should be expected of him, except under circumstances obvious to any fisherman. I know that this would sometimes involve a slight loss of speed in the chase; but long experience in various whalemen of more than one nation has convinced me that in the vast majority of failures in the fishery, it has not by any means been so much the speed of the whale as the before described exhaustion of the harpooneer that has caused them.

To insure the greatest efficiency in the dart, the harpooneers of this world must start to their feet from out of idleness, and not from out of toil.






CHAPTER 63. The Crotch.
Out of the trunk, the branches grow; out of them, the twigs. So, in productive subjects, grow the chapters.

The crotch alluded to on a previous page deserves independent mention. It is a notched stick of a peculiar form, some two feet in length, which is perpendicularly inserted into the starboard gunwale near the bow, for the purpose of furnishing a rest for the wooden extremity of the harpoon, whose other naked, barbed end slopingly projects from the prow. Thereby the weapon is instantly at hand to its hurler, who snatches it up as readily from its rest as a backwoodsman swings his rifle from the wall. It is customary to have two harpoons reposing in the crotch, respectively called the first and second irons.

But these two harpoons, each by its own cord, are both connected with the line; the object being this: to dart them both, if possible, one instantly after the other into the same whale; so that if, in the coming drag, one should draw out, the other may still retain a hold. It is a doubling of the chances. But it very often happens that owing to the instantaneous, violent, convulsive running of the whale upon receiving the first iron, it becomes impossible for the harpooneer, however lightning-like in his movements, to pitch the second iron into him. Nevertheless, as the second iron is already connected with the line, and the line is running, hence that weapon must, at all events, be anticipatingly tossed out of the boat, somehow and somewhere; else the most terrible jeopardy would involve all hands. Tumbled into the water, it accordingly is in such cases; the spare coils of box line (mentioned in a preceding chapter) making this feat, in most instances, prudently practicable. But this critical act is not always unattended with the saddest and most fatal casualties.

Furthermore: you must know that when the second iron is thrown overboard, it thenceforth becomes a dangling, sharp-edged terror, skittishly curvetting about both boat and whale, entangling the lines, or cutting them, and making a prodigious sensation in all directions. Nor, in general, is it possible to secure it again until the whale is fairly captured and a corpse.

Consider, now, how it must be in the case of four boats all engaging one unusually strong, active, and knowing whale; when owing to these qualities in him, as well as to the thousand concurring accidents of such an audacious enterprise, eight or ten loose second irons may be simultaneously dangling about him. For, of course, each boat is supplied with several harpoons to bend on to the line should the first one be ineffectually darted without recovery. All these particulars are faithfully narrated here, as they will not fail to elucidate several most important, however intricate passages, in scenes hereafter to be painted.






CHAPTER 64. Stubb’s Supper.
Stubb’s whale had been killed some distance from the ship. It was a calm; so, forming a tandem of three boats, we commenced the slow business of towing the trophy to the Pequod. And now, as we eighteen men with our thirty-six arms, and one hundred and eighty thumbs and fingers, slowly toiled hour after hour upon that inert, sluggish corpse in the sea; and it seemed hardly to budge at all, except at long intervals; good evidence was hereby furnished of the enormousness of the mass we moved. For, upon the great canal of Hang-Ho, or whatever they call it, in China, four or five laborers on the foot-path will draw a bulky freighted junk at the rate of a mile an hour; but this grand argosy we towed heavily forged along, as if laden with pig-lead in bulk.

Darkness came on; but three lights up and down in the Pequod’s main-rigging dimly guided our way; till drawing nearer we saw Ahab dropping one of several more lanterns over the bulwarks. Vacantly eyeing the heaving whale for a moment, he issued the usual orders for securing it for the night, and then handing his lantern to a seaman, went his way into the cabin, and did not come forward again until morning.

Though, in overseeing the pursuit of this whale, Captain Ahab had evinced his customary activity, to call it so; yet now that the creature was dead, some vague dissatisfaction, or impatience, or despair, seemed working in him; as if the sight of that dead body reminded him that Moby Dick was yet to be slain; and though a thousand other whales were brought to his ship, all that would not one jot advance his grand, monomaniac object. Very soon you would have thought from the sound on the Pequod’s decks, that all hands were preparing to cast anchor in the deep; for heavy chains are being dragged along the deck, and thrust rattling out of the port-holes. But by those clanking links, the vast corpse itself, not the ship, is to be moored. Tied by the head to the stern, and by the tail to the bows, the whale now lies with its black hull close to the vessel’s and seen through the darkness of the night, which obscured the spars and rigging aloft, the two—ship and whale, seemed yoked together like colossal bullocks, whereof one reclines while the other remains standing.*

*A little item may as well be related here. The strongest and most reliable hold which the ship has upon the whale when moored alongside, is by the flukes or tail; and as from its greater density that part is relatively heavier than any other (excepting the side-fins), its flexibility even in death, causes it to sink low beneath the surface; so that with the hand you cannot get at it from the boat, in order to put the chain round it. But this difficulty is ingeniously overcome: a small, strong line is prepared with a wooden float at its outer end, and a weight in its middle, while the other end is secured to the ship. By adroit management the wooden float is made to rise on the other side of the mass, so that now having girdled the whale, the chain is readily made to follow suit; and being slipped along the body, is at last locked fast round the smallest part of the tail, at the point of junction with its broad flukes or lobes.

If moody Ahab was now all quiescence, at least so far as could be known on deck, Stubb, his second mate, flushed with conquest, betrayed an unusual but still good-natured excitement. Such an unwonted bustle was he in that the staid Starbuck, his official superior, quietly resigned to him for the time the sole management of affairs. One small, helping cause of all this liveliness in Stubb, was soon made strangely manifest. Stubb was a high liver; he was somewhat intemperately fond of the whale as a flavorish thing to his palate.

“A steak, a steak, ere I sleep! You, Daggoo! overboard you go, and cut me one from his small!”

Here be it known, that though these wild fishermen do not, as a general thing, and according to the great military maxim, make the enemy defray the current expenses of the war (at least before realizing the proceeds of the voyage), yet now and then you find some of these Nantucketers who have a genuine relish for that particular part of the Sperm Whale designated by Stubb; comprising the tapering extremity of the body.

About midnight that steak was cut and cooked; and lighted by two lanterns of sperm oil, Stubb stoutly stood up to his spermaceti supper at the capstan-head, as if that capstan were a sideboard. Nor was Stubb the only banqueter on whale’s flesh that night. Mingling their mumblings with his own mastications, thousands on thousands of sharks, swarming round the dead leviathan, smackingly feasted on its fatness. The few sleepers below in their bunks were often startled by the sharp slapping of their tails against the hull, within a few inches of the sleepers’ hearts. Peering over the side you could just see them (as before you heard them) wallowing in the sullen, black waters, and turning over on their backs as they scooped out huge globular pieces of the whale of the bigness of a human head. This particular feat of the shark seems all but miraculous. How at such an apparently unassailable surface, they contrive to gouge out such symmetrical mouthfuls, remains a part of the universal problem of all things. The mark they thus leave on the whale, may best be likened to the hollow made by a carpenter in countersinking for a screw.

Though amid all the smoking horror and diabolism of a sea-fight, sharks will be seen longingly gazing up to the ship’s decks, like hungry dogs round a table where red meat is being carved, ready to bolt down every killed man that is tossed to them; and though, while the valiant butchers over the deck-table are thus cannibally carving each other’s live meat with carving-knives all gilded and tasselled, the sharks, also, with their jewel-hilted mouths, are quarrelsomely carving away under the table at the dead meat; and though, were you to turn the whole affair upside down, it would still be pretty much the same thing, that is to say, a shocking sharkish business enough for all parties; and though sharks also are the invariable outriders of all slave ships crossing the Atlantic, systematically trotting alongside, to be handy in case a parcel is to be carried anywhere, or a dead slave to be decently buried; and though one or two other like instances might be set down, touching the set terms, places, and occasions, when sharks do most socially congregate, and most hilariously feast; yet is there no conceivable time or occasion when you will find them in such countless numbers, and in gayer or more jovial spirits, than around a dead sperm whale, moored by night to a whaleship at sea. If you have never seen that sight, then suspend your decision about the propriety of devil-worship, and the expediency of conciliating the devil.

But, as yet, Stubb heeded not the mumblings of the banquet that was going on so nigh him, no more than the sharks heeded the smacking of his own epicurean lips.

“Cook, cook!—where’s that old Fleece?” he cried at length, widening his legs still further, as if to form a more secure base for his supper; and, at the same time darting his fork into the dish, as if stabbing with his lance; “cook, you cook!—sail this way, cook!”

The old black, not in any very high glee at having been previously roused from his warm hammock at a most unseasonable hour, came shambling along from his galley, for, like many old blacks, there was something the matter with his knee-pans, which he did not keep well scoured like his other pans; this old Fleece, as they called him, came shuffling and limping along, assisting his step with his tongs, which, after a clumsy fashion, were made of straightened iron hoops; this old Ebony floundered along, and in obedience to the word of command, came to a dead stop on the opposite side of Stubb’s sideboard; when, with both hands folded before him, and resting on his two-legged cane, he bowed his arched back still further over, at the same time sideways inclining his head, so as to bring his best ear into play.

“Cook,” said Stubb, rapidly lifting a rather reddish morsel to his mouth, “don’t you think this steak is rather overdone? You’ve been beating this steak too much, cook; it’s too tender. Don’t I always say that to be good, a whale-steak must be tough? There are those sharks now over the side, don’t you see they prefer it tough and rare? What a shindy they are kicking up! Cook, go and talk to ’em; tell ’em they are welcome to help themselves civilly, and in moderation, but they must keep quiet. Blast me, if I can hear my own voice. Away, cook, and deliver my message. Here, take this lantern,” snatching one from his sideboard; “now then, go and preach to ’em!”

Sullenly taking the offered lantern, old Fleece limped across the deck to the bulwarks; and then, with one hand dropping his light low over the sea, so as to get a good view of his congregation, with the other hand he solemnly flourished his tongs, and leaning far over the side in a mumbling voice began addressing the sharks, while Stubb, softly crawling behind, overheard all that was said.

“Fellow-critters: I’se ordered here to say dat you must stop dat dam noise dare. You hear? Stop dat dam smackin’ ob de lip! Massa Stubb say dat you can fill your dam bellies up to de hatchings, but by Gor! you must stop dat dam racket!”

“Cook,” here interposed Stubb, accompanying the word with a sudden slap on the shoulder,—“Cook! why, damn your eyes, you mustn’t swear that way when you’re preaching. That’s no way to convert sinners, cook!”

“Who dat? Den preach to him yourself,” sullenly turning to go.

“No, cook; go on, go on.”

“Well, den, Belubed fellow-critters:”—

“Right!” exclaimed Stubb, approvingly, “coax ’em to it; try that,” and Fleece continued.

“Do you is all sharks, and by natur wery woracious, yet I zay to you, fellow-critters, dat dat woraciousness—’top dat dam slappin’ ob de tail! How you tink to hear, spose you keep up such a dam slappin’ and bitin’ dare?”

“Cook,” cried Stubb, collaring him, “I won’t have that swearing. Talk to ’em gentlemanly.”

Once more the sermon proceeded.

“Your woraciousness, fellow-critters, I don’t blame ye so much for; dat is natur, and can’t be helped; but to gobern dat wicked natur, dat is de pint. You is sharks, sartin; but if you gobern de shark in you, why den you be angel; for all angel is not’ing more dan de shark well goberned. Now, look here, bred’ren, just try wonst to be cibil, a helping yourselbs from dat whale. Don’t be tearin’ de blubber out your neighbour’s mout, I say. Is not one shark dood right as toder to dat whale? And, by Gor, none on you has de right to dat whale; dat whale belong to some one else. I know some o’ you has berry brig mout, brigger dan oders; but den de brig mouts sometimes has de small bellies; so dat de brigness of de mout is not to swaller wid, but to bit off de blubber for de small fry ob sharks, dat can’t get into de scrouge to help demselves.”

“Well done, old Fleece!” cried Stubb, “that’s Christianity; go on.”

“No use goin’ on; de dam willains will keep a scougin’ and slappin’ each oder, Massa Stubb; dey don’t hear one word; no use a-preachin’ to such dam g’uttons as you call ’em, till dare bellies is full, and dare bellies is bottomless; and when dey do get ’em full, dey wont hear you den; for den dey sink in de sea, go fast to sleep on de coral, and can’t hear not’ing at all, no more, for eber and eber.”

“Upon my soul, I am about of the same opinion; so give the benediction, Fleece, and I’ll away to my supper.”

Upon this, Fleece, holding both hands over the fishy mob, raised his shrill voice, and cried—

“Cussed fellow-critters! Kick up de damndest row as ever you can; fill your dam’ bellies ’till dey bust—and den die.”

“Now, cook,” said Stubb, resuming his supper at the capstan; “stand just where you stood before, there, over against me, and pay particular attention.”

“All dention,” said Fleece, again stooping over upon his tongs in the desired position.

“Well,” said Stubb, helping himself freely meanwhile; “I shall now go back to the subject of this steak. In the first place, how old are you, cook?”

“What dat do wid de ’teak,” said the old black, testily.

“Silence! How old are you, cook?”

“’Bout ninety, dey say,” he gloomily muttered.

“And you have lived in this world hard upon one hundred years, cook, and don’t know yet how to cook a whale-steak?” rapidly bolting another mouthful at the last word, so that morsel seemed a continuation of the question. “Where were you born, cook?”

“’Hind de hatchway, in ferry-boat, goin’ ober de Roanoke.”

“Born in a ferry-boat! That’s queer, too. But I want to know what country you were born in, cook!”

“Didn’t I say de Roanoke country?” he cried sharply.

“No, you didn’t, cook; but I’ll tell you what I’m coming to, cook. You must go home and be born over again; you don’t know how to cook a whale-steak yet.”

“Bress my soul, if I cook noder one,” he growled, angrily, turning round to depart.

“Come back, cook;—here, hand me those tongs;—now take that bit of steak there, and tell me if you think that steak cooked as it should be? Take it, I say”—holding the tongs towards him—“take it, and taste it.”

Faintly smacking his withered lips over it for a moment, the old negro muttered, “Best cooked ’teak I eber taste; joosy, berry joosy.”

“Cook,” said Stubb, squaring himself once more; “do you belong to the church?”

“Passed one once in Cape-Down,” said the old man sullenly.

“And you have once in your life passed a holy church in Cape-Town, where you doubtless overheard a holy parson addressing his hearers as his beloved fellow-creatures, have you, cook! And yet you come here, and tell me such a dreadful lie as you did just now, eh?” said Stubb. “Where do you expect to go to, cook?”

“Go to bed berry soon,” he mumbled, half-turning as he spoke.

“Avast! heave to! I mean when you die, cook. It’s an awful question. Now what’s your answer?”

“When dis old brack man dies,” said the negro slowly, changing his whole air and demeanor, “he hisself won’t go nowhere; but some bressed angel will come and fetch him.”

“Fetch him? How? In a coach and four, as they fetched Elijah? And fetch him where?”

“Up dere,” said Fleece, holding his tongs straight over his head, and keeping it there very solemnly.

“So, then, you expect to go up into our main-top, do you, cook, when you are dead? But don’t you know the higher you climb, the colder it gets? Main-top, eh?”

“Didn’t say dat t’all,” said Fleece, again in the sulks.

“You said up there, didn’t you? and now look yourself, and see where your tongs are pointing. But, perhaps you expect to get into heaven by crawling through the lubber’s hole, cook; but, no, no, cook, you don’t get there, except you go the regular way, round by the rigging. It’s a ticklish business, but must be done, or else it’s no go. But none of us are in heaven yet. Drop your tongs, cook, and hear my orders. Do ye hear? Hold your hat in one hand, and clap t’other a’top of your heart, when I’m giving my orders, cook. What! that your heart, there?—that’s your gizzard! Aloft! aloft!—that’s it—now you have it. Hold it there now, and pay attention.”

“All ’dention,” said the old black, with both hands placed as desired, vainly wriggling his grizzled head, as if to get both ears in front at one and the same time.

“Well then, cook, you see this whale-steak of yours was so very bad, that I have put it out of sight as soon as possible; you see that, don’t you? Well, for the future, when you cook another whale-steak for my private table here, the capstan, I’ll tell you what to do so as not to spoil it by overdoing. Hold the steak in one hand, and show a live coal to it with the other; that done, dish it; d’ye hear? And now to-morrow, cook, when we are cutting in the fish, be sure you stand by to get the tips of his fins; have them put in pickle. As for the ends of the flukes, have them soused, cook. There, now ye may go.”

But Fleece had hardly got three paces off, when he was recalled.

“Cook, give me cutlets for supper to-morrow night in the mid-watch. D’ye hear? away you sail, then.—Halloa! stop! make a bow before you go.—Avast heaving again! Whale-balls for breakfast—don’t forget.”

“Wish, by gor! whale eat him, ’stead of him eat whale. I’m bressed if he ain’t more of shark dan Massa Shark hisself,” muttered the old man, limping away; with which sage ejaculation he went to his hammock.






CHAPTER 65. The Whale as a Dish.
That mortal man should feed upon the creature that feeds his lamp, and, like Stubb, eat him by his own light, as you may say; this seems so outlandish a thing that one must needs go a little into the history and philosophy of it.

It is upon record, that three centuries ago the tongue of the Right Whale was esteemed a great delicacy in France, and commanded large prices there. Also, that in Henry VIIIth’s time, a certain cook of the court obtained a handsome reward for inventing an admirable sauce to be eaten with barbacued porpoises, which, you remember, are a species of whale. Porpoises, indeed, are to this day considered fine eating. The meat is made into balls about the size of billiard balls, and being well seasoned and spiced might be taken for turtle-balls or veal balls. The old monks of Dunfermline were very fond of them. They had a great porpoise grant from the crown.

The fact is, that among his hunters at least, the whale would by all hands be considered a noble dish, were there not so much of him; but when you come to sit down before a meat-pie nearly one hundred feet long, it takes away your appetite. Only the most unprejudiced of men like Stubb, nowadays partake of cooked whales; but the Esquimaux are not so fastidious. We all know how they live upon whales, and have rare old vintages of prime old train oil. Zogranda, one of their most famous doctors, recommends strips of blubber for infants, as being exceedingly juicy and nourishing. And this reminds me that certain Englishmen, who long ago were accidentally left in Greenland by a whaling vessel—that these men actually lived for several months on the mouldy scraps of whales which had been left ashore after trying out the blubber. Among the Dutch whalemen these scraps are called “fritters”; which, indeed, they greatly resemble, being brown and crisp, and smelling something like old Amsterdam housewives’ dough-nuts or oly-cooks, when fresh. They have such an eatable look that the most self-denying stranger can hardly keep his hands off.

But what further depreciates the whale as a civilized dish, is his exceeding richness. He is the great prize ox of the sea, too fat to be delicately good. Look at his hump, which would be as fine eating as the buffalo’s (which is esteemed a rare dish), were it not such a solid pyramid of fat. But the spermaceti itself, how bland and creamy that is; like the transparent, half-jellied, white meat of a cocoanut in the third month of its growth, yet far too rich to supply a substitute for butter. Nevertheless, many whalemen have a method of absorbing it into some other substance, and then partaking of it. In the long try watches of the night it is a common thing for the seamen to dip their ship-biscuit into the huge oil-pots and let them fry there awhile. Many a good supper have I thus made.

In the case of a small Sperm Whale the brains are accounted a fine dish. The casket of the skull is broken into with an axe, and the two plump, whitish lobes being withdrawn (precisely resembling two large puddings), they are then mixed with flour, and cooked into a most delectable mess, in flavor somewhat resembling calves’ head, which is quite a dish among some epicures; and every one knows that some young bucks among the epicures, by continually dining upon calves’ brains, by and by get to have a little brains of their own, so as to be able to tell a calf’s head from their own heads; which, indeed, requires uncommon discrimination. And that is the reason why a young buck with an intelligent looking calf’s head before him, is somehow one of the saddest sights you can see. The head looks a sort of reproachfully at him, with an “Et tu Brute!” expression.

It is not, perhaps, entirely because the whale is so excessively unctuous that landsmen seem to regard the eating of him with abhorrence; that appears to result, in some way, from the consideration before mentioned: i.e. that a man should eat a newly murdered thing of the sea, and eat it too by its own light. But no doubt the first man that ever murdered an ox was regarded as a murderer; perhaps he was hung; and if he had been put on his trial by oxen, he certainly would have been; and he certainly deserved it if any murderer does. Go to the meat-market of a Saturday night and see the crowds of live bipeds staring up at the long rows of dead quadrupeds. Does not that sight take a tooth out of the cannibal’s jaw? Cannibals? who is not a cannibal? I tell you it will be more tolerable for the Fejee that salted down a lean missionary in his cellar against a coming famine; it will be more tolerable for that provident Fejee, I say, in the day of judgment, than for thee, civilized and enlightened gourmand, who nailest geese to the ground and feastest on their bloated livers in thy paté-de-foie-gras.

But Stubb, he eats the whale by its own light, does he? and that is adding insult to injury, is it? Look at your knife-handle, there, my civilized and enlightened gourmand dining off that roast beef, what is that handle made of?—what but the bones of the brother of the very ox you are eating? And what do you pick your teeth with, after devouring that fat goose? With a feather of the same fowl. And with what quill did the Secretary of the Society for the Suppression of Cruelty to Ganders formally indite his circulars? It is only within the last month or two that that society passed a resolution to patronize nothing but steel pens.






CHAPTER 66. The Shark Massacre.
When in the Southern Fishery, a captured Sperm Whale, after long and weary toil, is brought alongside late at night, it is not, as a general thing at least, customary to proceed at once to the business of cutting him in. For that business is an exceedingly laborious one; is not very soon completed; and requires all hands to set about it. Therefore, the common usage is to take in all sail; lash the helm a’lee; and then send every one below to his hammock till daylight, with the reservation that, until that time, anchor-watches shall be kept; that is, two and two for an hour, each couple, the crew in rotation shall mount the deck to see that all goes well.

But sometimes, especially upon the Line in the Pacific, this plan will not answer at all; because such incalculable hosts of sharks gather round the moored carcase, that were he left so for six hours, say, on a stretch, little more than the skeleton would be visible by morning. In most other parts of the ocean, however, where these fish do not so largely abound, their wondrous voracity can be at times considerably diminished, by vigorously stirring them up with sharp whaling-spades, a procedure notwithstanding, which, in some instances, only seems to tickle them into still greater activity. But it was not thus in the present case with the Pequod’s sharks; though, to be sure, any man unaccustomed to such sights, to have looked over her side that night, would have almost thought the whole round sea was one huge cheese, and those sharks the maggots in it.

Nevertheless, upon Stubb setting the anchor-watch after his supper was concluded; and when, accordingly, Queequeg and a forecastle seaman came on deck, no small excitement was created among the sharks; for immediately suspending the cutting stages over the side, and lowering three lanterns, so that they cast long gleams of light over the turbid sea, these two mariners, darting their long whaling-spades, kept up an incessant murdering of the sharks,* by striking the keen steel deep into their skulls, seemingly their only vital part. But in the foamy confusion of their mixed and struggling hosts, the marksmen could not always hit their mark; and this brought about new revelations of the incredible ferocity of the foe. They viciously snapped, not only at each other’s disembowelments, but like flexible bows, bent round, and bit their own; till those entrails seemed swallowed over and over again by the same mouth, to be oppositely voided by the gaping wound. Nor was this all. It was unsafe to meddle with the corpses and ghosts of these creatures. A sort of generic or Pantheistic vitality seemed to lurk in their very joints and bones, after what might be called the individual life had departed. Killed and hoisted on deck for the sake of his skin, one of these sharks almost took poor Queequeg’s hand off, when he tried to shut down the dead lid of his murderous jaw.

*The whaling-spade used for cutting-in is made of the very best steel; is about the bigness of a man’s spread hand; and in general shape, corresponds to the garden implement after which it is named; only its sides are perfectly flat, and its upper end considerably narrower than the lower. This weapon is always kept as sharp as possible; and when being used is occasionally honed, just like a razor. In its socket, a stiff pole, from twenty to thirty feet long, is inserted for a handle.

“Queequeg no care what god made him shark,” said the savage, agonizingly lifting his hand up and down; “wedder Fejee god or Nantucket god; but de god wat made shark must be one dam Ingin.”






CHAPTER 67. Cutting In.
It was a Saturday night, and such a Sabbath as followed! Ex officio professors of Sabbath breaking are all whalemen. The ivory Pequod was turned into what seemed a shamble; every sailor a butcher. You would have thought we were offering up ten thousand red oxen to the sea gods.

In the first place, the enormous cutting tackles, among other ponderous things comprising a cluster of blocks generally painted green, and which no single man can possibly lift—this vast bunch of grapes was swayed up to the main-top and firmly lashed to the lower mast-head, the strongest point anywhere above a ship’s deck. The end of the hawser-like rope winding through these intricacies, was then conducted to the windlass, and the huge lower block of the tackles was swung over the whale; to this block the great blubber hook, weighing some one hundred pounds, was attached. And now suspended in stages over the side, Starbuck and Stubb, the mates, armed with their long spades, began cutting a hole in the body for the insertion of the hook just above the nearest of the two side-fins. This done, a broad, semicircular line is cut round the hole, the hook is inserted, and the main body of the crew striking up a wild chorus, now commence heaving in one dense crowd at the windlass. When instantly, the entire ship careens over on her side; every bolt in her starts like the nail-heads of an old house in frosty weather; she trembles, quivers, and nods her frighted mast-heads to the sky. More and more she leans over to the whale, while every gasping heave of the windlass is answered by a helping heave from the billows; till at last, a swift, startling snap is heard; with a great swash the ship rolls upwards and backwards from the whale, and the triumphant tackle rises into sight dragging after it the disengaged semicircular end of the first strip of blubber. Now as the blubber envelopes the whale precisely as the rind does an orange, so is it stripped off from the body precisely as an orange is sometimes stripped by spiralizing it. For the strain constantly kept up by the windlass continually keeps the whale rolling over and over in the water, and as the blubber in one strip uniformly peels off along the line called the “scarf,” simultaneously cut by the spades of Starbuck and Stubb, the mates; and just as fast as it is thus peeled off, and indeed by that very act itself, it is all the time being hoisted higher and higher aloft till its upper end grazes the main-top; the men at the windlass then cease heaving, and for a moment or two the prodigious blood-dripping mass sways to and fro as if let down from the sky, and every one present must take good heed to dodge it when it swings, else it may box his ears and pitch him headlong overboard.

One of the attending harpooneers now advances with a long, keen weapon called a boarding-sword, and watching his chance he dexterously slices out a considerable hole in the lower part of the swaying mass. Into this hole, the end of the second alternating great tackle is then hooked so as to retain a hold upon the blubber, in order to prepare for what follows. Whereupon, this accomplished swordsman, warning all hands to stand off, once more makes a scientific dash at the mass, and with a few sidelong, desperate, lunging slicings, severs it completely in twain; so that while the short lower part is still fast, the long upper strip, called a blanket-piece, swings clear, and is all ready for lowering. The heavers forward now resume their song, and while the one tackle is peeling and hoisting a second strip from the whale, the other is slowly slackened away, and down goes the first strip through the main hatchway right beneath, into an unfurnished parlor called the blubber-room. Into this twilight apartment sundry nimble hands keep coiling away the long blanket-piece as if it were a great live mass of plaited serpents. And thus the work proceeds; the two tackles hoisting and lowering simultaneously; both whale and windlass heaving, the heavers singing, the blubber-room gentlemen coiling, the mates scarfing, the ship straining, and all hands swearing occasionally, by way of assuaging the general friction.






CHAPTER 68. The Blanket.
I have given no small attention to that not unvexed subject, the skin of the whale. I have had controversies about it with experienced whalemen afloat, and learned naturalists ashore. My original opinion remains unchanged; but it is only an opinion.

The question is, what and where is the skin of the whale? Already you know what his blubber is. That blubber is something of the consistence of firm, close-grained beef, but tougher, more elastic and compact, and ranges from eight or ten to twelve and fifteen inches in thickness.

Now, however preposterous it may at first seem to talk of any creature’s skin as being of that sort of consistence and thickness, yet in point of fact these are no arguments against such a presumption; because you cannot raise any other dense enveloping layer from the whale’s body but that same blubber; and the outermost enveloping layer of any animal, if reasonably dense, what can that be but the skin? True, from the unmarred dead body of the whale, you may scrape off with your hand an infinitely thin, transparent substance, somewhat resembling the thinnest shreds of isinglass, only it is almost as flexible and soft as satin; that is, previous to being dried, when it not only contracts and thickens, but becomes rather hard and brittle. I have several such dried bits, which I use for marks in my whale-books. It is transparent, as I said before; and being laid upon the printed page, I have sometimes pleased myself with fancying it exerted a magnifying influence. At any rate, it is pleasant to read about whales through their own spectacles, as you may say. But what I am driving at here is this. That same infinitely thin, isinglass substance, which, I admit, invests the entire body of the whale, is not so much to be regarded as the skin of the creature, as the skin of the skin, so to speak; for it were simply ridiculous to say, that the proper skin of the tremendous whale is thinner and more tender than the skin of a new-born child. But no more of this.

Assuming the blubber to be the skin of the whale; then, when this skin, as in the case of a very large Sperm Whale, will yield the bulk of one hundred barrels of oil; and, when it is considered that, in quantity, or rather weight, that oil, in its expressed state, is only three fourths, and not the entire substance of the coat; some idea may hence be had of the enormousness of that animated mass, a mere part of whose mere integument yields such a lake of liquid as that. Reckoning ten barrels to the ton, you have ten tons for the net weight of only three quarters of the stuff of the whale’s skin.

In life, the visible surface of the Sperm Whale is not the least among the many marvels he presents. Almost invariably it is all over obliquely crossed and re-crossed with numberless straight marks in thick array, something like those in the finest Italian line engravings. But these marks do not seem to be impressed upon the isinglass substance above mentioned, but seem to be seen through it, as if they were engraved upon the body itself. Nor is this all. In some instances, to the quick, observant eye, those linear marks, as in a veritable engraving, but afford the ground for far other delineations. These are hieroglyphical; that is, if you call those mysterious cyphers on the walls of pyramids hieroglyphics, then that is the proper word to use in the present connexion. By my retentive memory of the hieroglyphics upon one Sperm Whale in particular, I was much struck with a plate representing the old Indian characters chiselled on the famous hieroglyphic palisades on the banks of the Upper Mississippi. Like those mystic rocks, too, the mystic-marked whale remains undecipherable. This allusion to the Indian rocks reminds me of another thing. Besides all the other phenomena which the exterior of the Sperm Whale presents, he not seldom displays the back, and more especially his flanks, effaced in great part of the regular linear appearance, by reason of numerous rude scratches, altogether of an irregular, random aspect. I should say that those New England rocks on the sea-coast, which Agassiz imagines to bear the marks of violent scraping contact with vast floating icebergs—I should say, that those rocks must not a little resemble the Sperm Whale in this particular. It also seems to me that such scratches in the whale are probably made by hostile contact with other whales; for I have most remarked them in the large, full-grown bulls of the species.

A word or two more concerning this matter of the skin or blubber of the whale. It has already been said, that it is stript from him in long pieces, called blanket-pieces. Like most sea-terms, this one is very happy and significant. For the whale is indeed wrapt up in his blubber as in a real blanket or counterpane; or, still better, an Indian poncho slipt over his head, and skirting his extremity. It is by reason of this cosy blanketing of his body, that the whale is enabled to keep himself comfortable in all weathers, in all seas, times, and tides. What would become of a Greenland whale, say, in those shuddering, icy seas of the North, if unsupplied with his cosy surtout? True, other fish are found exceedingly brisk in those Hyperborean waters; but these, be it observed, are your cold-blooded, lungless fish, whose very bellies are refrigerators; creatures, that warm themselves under the lee of an iceberg, as a traveller in winter would bask before an inn fire; whereas, like man, the whale has lungs and warm blood. Freeze his blood, and he dies. How wonderful is it then—except after explanation—that this great monster, to whom corporeal warmth is as indispensable as it is to man; how wonderful that he should be found at home, immersed to his lips for life in those Arctic waters! where, when seamen fall overboard, they are sometimes found, months afterwards, perpendicularly frozen into the hearts of fields of ice, as a fly is found glued in amber. But more surprising is it to know, as has been proved by experiment, that the blood of a Polar whale is warmer than that of a Borneo negro in summer.

It does seem to me, that herein we see the rare virtue of a strong individual vitality, and the rare virtue of thick walls, and the rare virtue of interior spaciousness. Oh, man! admire and model thyself after the whale! Do thou, too, remain warm among ice. Do thou, too, live in this world without being of it. Be cool at the equator; keep thy blood fluid at the Pole. Like the great dome of St. Peter’s, and like the great whale, retain, O man! in all seasons a temperature of thine own.

But how easy and how hopeless to teach these fine things! Of erections, how few are domed like St. Peter’s! of creatures, how few vast as the whale!






CHAPTER 69. The Funeral.
“Haul in the chains! Let the carcase go astern!”

The vast tackles have now done their duty. The peeled white body of the beheaded whale flashes like a marble sepulchre; though changed in hue, it has not perceptibly lost anything in bulk. It is still colossal. Slowly it floats more and more away, the water round it torn and splashed by the insatiate sharks, and the air above vexed with rapacious flights of screaming fowls, whose beaks are like so many insulting poniards in the whale. The vast white headless phantom floats further and further from the ship, and every rod that it so floats, what seem square roods of sharks and cubic roods of fowls, augment the murderous din. For hours and hours from the almost stationary ship that hideous sight is seen. Beneath the unclouded and mild azure sky, upon the fair face of the pleasant sea, wafted by the joyous breezes, that great mass of death floats on and on, till lost in infinite perspectives.

There’s a most doleful and most mocking funeral! The sea-vultures all in pious mourning, the air-sharks all punctiliously in black or speckled. In life but few of them would have helped the whale, I ween, if peradventure he had needed it; but upon the banquet of his funeral they most piously do pounce. Oh, horrible vultureism of earth! from which not the mightiest whale is free.

Nor is this the end. Desecrated as the body is, a vengeful ghost survives and hovers over it to scare. Espied by some timid man-of-war or blundering discovery-vessel from afar, when the distance obscuring the swarming fowls, nevertheless still shows the white mass floating in the sun, and the white spray heaving high against it; straightway the whale’s unharming corpse, with trembling fingers is set down in the log—shoals, rocks, and breakers hereabouts: beware! And for years afterwards, perhaps, ships shun the place; leaping over it as silly sheep leap over a vacuum, because their leader originally leaped there when a stick was held. There’s your law of precedents; there’s your utility of traditions; there’s the story of your obstinate survival of old beliefs never bottomed on the earth, and now not even hovering in the air! There’s orthodoxy!

Thus, while in life the great whale’s body may have been a real terror to his foes, in his death his ghost becomes a powerless panic to a world.

Are you a believer in ghosts, my friend? There are other ghosts than the Cock-Lane one, and far deeper men than Doctor Johnson who believe in them.






CHAPTER 70. The Sphynx.
It should not have been omitted that previous to completely stripping the body of the leviathan, he was beheaded. Now, the beheading of the Sperm Whale is a scientific anatomical feat, upon which experienced whale surgeons very much pride themselves: and not without reason.

Consider that the whale has nothing that can properly be called a neck; on the contrary, where his head and body seem to join, there, in that very place, is the thickest part of him. Remember, also, that the surgeon must operate from above, some eight or ten feet intervening between him and his subject, and that subject almost hidden in a discoloured, rolling, and oftentimes tumultuous and bursting sea. Bear in mind, too, that under these untoward circumstances he has to cut many feet deep in the flesh; and in that subterraneous manner, without so much as getting one single peep into the ever-contracting gash thus made, he must skilfully steer clear of all adjacent, interdicted parts, and exactly divide the spine at a critical point hard by its insertion into the skull. Do you not marvel, then, at Stubb’s boast, that he demanded but ten minutes to behead a sperm whale?

When first severed, the head is dropped astern and held there by a cable till the body is stripped. That done, if it belong to a small whale it is hoisted on deck to be deliberately disposed of. But, with a full grown leviathan this is impossible; for the sperm whale’s head embraces nearly one third of his entire bulk, and completely to suspend such a burden as that, even by the immense tackles of a whaler, this were as vain a thing as to attempt weighing a Dutch barn in jewellers’ scales.

The Pequod’s whale being decapitated and the body stripped, the head was hoisted against the ship’s side—about half way out of the sea, so that it might yet in great part be buoyed up by its native element. And there with the strained craft steeply leaning over to it, by reason of the enormous downward drag from the lower mast-head, and every yard-arm on that side projecting like a crane over the waves; there, that blood-dripping head hung to the Pequod’s waist like the giant Holofernes’s from the girdle of Judith.

When this last task was accomplished it was noon, and the seamen went below to their dinner. Silence reigned over the before tumultuous but now deserted deck. An intense copper calm, like a universal yellow lotus, was more and more unfolding its noiseless measureless leaves upon the sea.

A short space elapsed, and up into this noiselessness came Ahab alone from his cabin. Taking a few turns on the quarter-deck, he paused to gaze over the side, then slowly getting into the main-chains he took Stubb’s long spade—still remaining there after the whale’s decapitation—and striking it into the lower part of the half-suspended mass, placed its other end crutch-wise under one arm, and so stood leaning over with eyes attentively fixed on this head.

It was a black and hooded head; and hanging there in the midst of so intense a calm, it seemed the Sphynx’s in the desert. “Speak, thou vast and venerable head,” muttered Ahab, “which, though ungarnished with a beard, yet here and there lookest hoary with mosses; speak, mighty head, and tell us the secret thing that is in thee. Of all divers, thou hast dived the deepest. That head upon which the upper sun now gleams, has moved amid this world’s foundations. Where unrecorded names and navies rust, and untold hopes and anchors rot; where in her murderous hold this frigate earth is ballasted with bones of millions of the drowned; there, in that awful water-land, there was thy most familiar home. Thou hast been where bell or diver never went; hast slept by many a sailor’s side, where sleepless mothers would give their lives to lay them down. Thou saw’st the locked lovers when leaping from their flaming ship; heart to heart they sank beneath the exulting wave; true to each other, when heaven seemed false to them. Thou saw’st the murdered mate when tossed by pirates from the midnight deck; for hours he fell into the deeper midnight of the insatiate maw; and his murderers still sailed on unharmed—while swift lightnings shivered the neighboring ship that would have borne a righteous husband to outstretched, longing arms. O head! thou hast seen enough to split the planets and make an infidel of Abraham, and not one syllable is thine!”

“Sail ho!” cried a triumphant voice from the main-mast-head.

“Aye? Well, now, that’s cheering,” cried Ahab, suddenly erecting himself, while whole thunder-clouds swept aside from his brow. “That lively cry upon this deadly calm might almost convert a better man.—Where away?”

“Three points on the starboard bow, sir, and bringing down her breeze to us!

“Better and better, man. Would now St. Paul would come along that way, and to my breezelessness bring his breeze! O Nature, and O soul of man! how far beyond all utterance are your linked analogies! not the smallest atom stirs or lives on matter, but has its cunning duplicate in mind.”






CHAPTER 71. The Jeroboam’s Story.
Hand in hand, ship and breeze blew on; but the breeze came faster than the ship, and soon the Pequod began to rock.

By and by, through the glass the stranger’s boats and manned mast-heads proved her a whale-ship. But as she was so far to windward, and shooting by, apparently making a passage to some other ground, the Pequod could not hope to reach her. So the signal was set to see what response would be made.

Here be it said, that like the vessels of military marines, the ships of the American Whale Fleet have each a private signal; all which signals being collected in a book with the names of the respective vessels attached, every captain is provided with it. Thereby, the whale commanders are enabled to recognise each other upon the ocean, even at considerable distances and with no small facility.

The Pequod’s signal was at last responded to by the stranger’s setting her own; which proved the ship to be the Jeroboam of Nantucket. Squaring her yards, she bore down, ranged abeam under the Pequod’s lee, and lowered a boat; it soon drew nigh; but, as the side-ladder was being rigged by Starbuck’s order to accommodate the visiting captain, the stranger in question waved his hand from his boat’s stern in token of that proceeding being entirely unnecessary. It turned out that the Jeroboam had a malignant epidemic on board, and that Mayhew, her captain, was fearful of infecting the Pequod’s company. For, though himself and boat’s crew remained untainted, and though his ship was half a rifle-shot off, and an incorruptible sea and air rolling and flowing between; yet conscientiously adhering to the timid quarantine of the land, he peremptorily refused to come into direct contact with the Pequod.

But this did by no means prevent all communications. Preserving an interval of some few yards between itself and the ship, the Jeroboam’s boat by the occasional use of its oars contrived to keep parallel to the Pequod, as she heavily forged through the sea (for by this time it blew very fresh), with her main-topsail aback; though, indeed, at times by the sudden onset of a large rolling wave, the boat would be pushed some way ahead; but would be soon skilfully brought to her proper bearings again. Subject to this, and other the like interruptions now and then, a conversation was sustained between the two parties; but at intervals not without still another interruption of a very different sort.

Pulling an oar in the Jeroboam’s boat, was a man of a singular appearance, even in that wild whaling life where individual notabilities make up all totalities. He was a small, short, youngish man, sprinkled all over his face with freckles, and wearing redundant yellow hair. A long-skirted, cabalistically-cut coat of a faded walnut tinge enveloped him; the overlapping sleeves of which were rolled up on his wrists. A deep, settled, fanatic delirium was in his eyes.

So soon as this figure had been first descried, Stubb had exclaimed—“That’s he! that’s he!—the long-togged scaramouch the Town-Ho’s company told us of!” Stubb here alluded to a strange story told of the Jeroboam, and a certain man among her crew, some time previous when the Pequod spoke the Town-Ho. According to this account and what was subsequently learned, it seemed that the scaramouch in question had gained a wonderful ascendency over almost everybody in the Jeroboam. His story was this:

He had been originally nurtured among the crazy society of Neskyeuna Shakers, where he had been a great prophet; in their cracked, secret meetings having several times descended from heaven by the way of a trap-door, announcing the speedy opening of the seventh vial, which he carried in his vest-pocket; but, which, instead of containing gunpowder, was supposed to be charged with laudanum. A strange, apostolic whim having seized him, he had left Neskyeuna for Nantucket, where, with that cunning peculiar to craziness, he assumed a steady, common-sense exterior, and offered himself as a green-hand candidate for the Jeroboam’s whaling voyage. They engaged him; but straightway upon the ship’s getting out of sight of land, his insanity broke out in a freshet. He announced himself as the archangel Gabriel, and commanded the captain to jump overboard. He published his manifesto, whereby he set himself forth as the deliverer of the isles of the sea and vicar-general of all Oceanica. The unflinching earnestness with which he declared these things;—the dark, daring play of his sleepless, excited imagination, and all the preternatural terrors of real delirium, united to invest this Gabriel in the minds of the majority of the ignorant crew, with an atmosphere of sacredness. Moreover, they were afraid of him. As such a man, however, was not of much practical use in the ship, especially as he refused to work except when he pleased, the incredulous captain would fain have been rid of him; but apprised that that individual’s intention was to land him in the first convenient port, the archangel forthwith opened all his seals and vials—devoting the ship and all hands to unconditional perdition, in case this intention was carried out. So strongly did he work upon his disciples among the crew, that at last in a body they went to the captain and told him if Gabriel was sent from the ship, not a man of them would remain. He was therefore forced to relinquish his plan. Nor would they permit Gabriel to be any way maltreated, say or do what he would; so that it came to pass that Gabriel had the complete freedom of the ship. The consequence of all this was, that the archangel cared little or nothing for the captain and mates; and since the epidemic had broken out, he carried a higher hand than ever; declaring that the plague, as he called it, was at his sole command; nor should it be stayed but according to his good pleasure. The sailors, mostly poor devils, cringed, and some of them fawned before him; in obedience to his instructions, sometimes rendering him personal homage, as to a god. Such things may seem incredible; but, however wondrous, they are true. Nor is the history of fanatics half so striking in respect to the measureless self-deception of the fanatic himself, as his measureless power of deceiving and bedevilling so many others. But it is time to return to the Pequod.

“I fear not thy epidemic, man,” said Ahab from the bulwarks, to Captain Mayhew, who stood in the boat’s stern; “come on board.”

But now Gabriel started to his feet.

“Think, think of the fevers, yellow and bilious! Beware of the horrible plague!”

“Gabriel! Gabriel!” cried Captain Mayhew; “thou must either—” But that instant a headlong wave shot the boat far ahead, and its seethings drowned all speech.

“Hast thou seen the White Whale?” demanded Ahab, when the boat drifted back.

“Think, think of thy whale-boat, stoven and sunk! Beware of the horrible tail!”

“I tell thee again, Gabriel, that—” But again the boat tore ahead as if dragged by fiends. Nothing was said for some moments, while a succession of riotous waves rolled by, which by one of those occasional caprices of the seas were tumbling, not heaving it. Meantime, the hoisted sperm whale’s head jogged about very violently, and Gabriel was seen eyeing it with rather more apprehensiveness than his archangel nature seemed to warrant.

When this interlude was over, Captain Mayhew began a dark story concerning Moby Dick; not, however, without frequent interruptions from Gabriel, whenever his name was mentioned, and the crazy sea that seemed leagued with him.

It seemed that the Jeroboam had not long left home, when upon speaking a whale-ship, her people were reliably apprised of the existence of Moby Dick, and the havoc he had made. Greedily sucking in this intelligence, Gabriel solemnly warned the captain against attacking the White Whale, in case the monster should be seen; in his gibbering insanity, pronouncing the White Whale to be no less a being than the Shaker God incarnated; the Shakers receiving the Bible. But when, some year or two afterwards, Moby Dick was fairly sighted from the mast-heads, Macey, the chief mate, burned with ardour to encounter him; and the captain himself being not unwilling to let him have the opportunity, despite all the archangel’s denunciations and forewarnings, Macey succeeded in persuading five men to man his boat. With them he pushed off; and, after much weary pulling, and many perilous, unsuccessful onsets, he at last succeeded in getting one iron fast. Meantime, Gabriel, ascending to the main-royal mast-head, was tossing one arm in frantic gestures, and hurling forth prophecies of speedy doom to the sacrilegious assailants of his divinity. Now, while Macey, the mate, was standing up in his boat’s bow, and with all the reckless energy of his tribe was venting his wild exclamations upon the whale, and essaying to get a fair chance for his poised lance, lo! a broad white shadow rose from the sea; by its quick, fanning motion, temporarily taking the breath out of the bodies of the oarsmen. Next instant, the luckless mate, so full of furious life, was smitten bodily into the air, and making a long arc in his descent, fell into the sea at the distance of about fifty yards. Not a chip of the boat was harmed, nor a hair of any oarsman’s head; but the mate for ever sank.

It is well to parenthesize here, that of the fatal accidents in the Sperm-Whale Fishery, this kind is perhaps almost as frequent as any. Sometimes, nothing is injured but the man who is thus annihilated; oftener the boat’s bow is knocked off, or the thigh-board, in which the headsman stands, is torn from its place and accompanies the body. But strangest of all is the circumstance, that in more instances than one, when the body has been recovered, not a single mark of violence is discernible; the man being stark dead.

The whole calamity, with the falling form of Macey, was plainly descried from the ship. Raising a piercing shriek—“The vial! the vial!” Gabriel called off the terror-stricken crew from the further hunting of the whale. This terrible event clothed the archangel with added influence; because his credulous disciples believed that he had specifically fore-announced it, instead of only making a general prophecy, which any one might have done, and so have chanced to hit one of many marks in the wide margin allowed. He became a nameless terror to the ship.

Mayhew having concluded his narration, Ahab put such questions to him, that the stranger captain could not forbear inquiring whether he intended to hunt the White Whale, if opportunity should offer. To which Ahab answered—“Aye.” Straightway, then, Gabriel once more started to his feet, glaring upon the old man, and vehemently exclaimed, with downward pointed finger—“Think, think of the blasphemer—dead, and down there!—beware of the blasphemer’s end!”

Ahab stolidly turned aside; then said to Mayhew, “Captain, I have just bethought me of my letter-bag; there is a letter for one of thy officers, if I mistake not. Starbuck, look over the bag.”

Every whale-ship takes out a goodly number of letters for various ships, whose delivery to the persons to whom they may be addressed, depends upon the mere chance of encountering them in the four oceans. Thus, most letters never reach their mark; and many are only received after attaining an age of two or three years or more.

Soon Starbuck returned with a letter in his hand. It was sorely tumbled, damp, and covered with a dull, spotted, green mould, in consequence of being kept in a dark locker of the cabin. Of such a letter, Death himself might well have been the post-boy.

“Can’st not read it?” cried Ahab. “Give it me, man. Aye, aye, it’s but a dim scrawl;—what’s this?” As he was studying it out, Starbuck took a long cutting-spade pole, and with his knife slightly split the end, to insert the letter there, and in that way, hand it to the boat, without its coming any closer to the ship.

Meantime, Ahab holding the letter, muttered, “Mr. Har—yes, Mr. Harry—(a woman’s pinny hand,—the man’s wife, I’ll wager)—Aye—Mr. Harry Macey, Ship Jeroboam;—why it’s Macey, and he’s dead!”

“Poor fellow! poor fellow! and from his wife,” sighed Mayhew; “but let me have it.”

“Nay, keep it thyself,” cried Gabriel to Ahab; “thou art soon going that way.”

“Curses throttle thee!” yelled Ahab. “Captain Mayhew, stand by now to receive it”; and taking the fatal missive from Starbuck’s hands, he caught it in the slit of the pole, and reached it over towards the boat. But as he did so, the oarsmen expectantly desisted from rowing; the boat drifted a little towards the ship’s stern; so that, as if by magic, the letter suddenly ranged along with Gabriel’s eager hand. He clutched it in an instant, seized the boat-knife, and impaling the letter on it, sent it thus loaded back into the ship. It fell at Ahab’s feet. Then Gabriel shrieked out to his comrades to give way with their oars, and in that manner the mutinous boat rapidly shot away from the Pequod.

As, after this interlude, the seamen resumed their work upon the jacket of the whale, many strange things were hinted in reference to this wild affair.






CHAPTER 72. The Monkey-Rope.
In the tumultuous business of cutting-in and attending to a whale, there is much running backwards and forwards among the crew. Now hands are wanted here, and then again hands are wanted there. There is no staying in any one place; for at one and the same time everything has to be done everywhere. It is much the same with him who endeavors the description of the scene. We must now retrace our way a little. It was mentioned that upon first breaking ground in the whale’s back, the blubber-hook was inserted into the original hole there cut by the spades of the mates. But how did so clumsy and weighty a mass as that same hook get fixed in that hole? It was inserted there by my particular friend Queequeg, whose duty it was, as harpooneer, to descend upon the monster’s back for the special purpose referred to. But in very many cases, circumstances require that the harpooneer shall remain on the whale till the whole flensing or stripping operation is concluded. The whale, be it observed, lies almost entirely submerged, excepting the immediate parts operated upon. So down there, some ten feet below the level of the deck, the poor harpooneer flounders about, half on the whale and half in the water, as the vast mass revolves like a tread-mill beneath him. On the occasion in question, Queequeg figured in the Highland costume—a shirt and socks—in which to my eyes, at least, he appeared to uncommon advantage; and no one had a better chance to observe him, as will presently be seen.

Being the savage’s bowsman, that is, the person who pulled the bow-oar in his boat (the second one from forward), it was my cheerful duty to attend upon him while taking that hard-scrabble scramble upon the dead whale’s back. You have seen Italian organ-boys holding a dancing-ape by a long cord. Just so, from the ship’s steep side, did I hold Queequeg down there in the sea, by what is technically called in the fishery a monkey-rope, attached to a strong strip of canvas belted round his waist.

It was a humorously perilous business for both of us. For, before we proceed further, it must be said that the monkey-rope was fast at both ends; fast to Queequeg’s broad canvas belt, and fast to my narrow leather one. So that for better or for worse, we two, for the time, were wedded; and should poor Queequeg sink to rise no more, then both usage and honor demanded, that instead of cutting the cord, it should drag me down in his wake. So, then, an elongated Siamese ligature united us. Queequeg was my own inseparable twin brother; nor could I any way get rid of the dangerous liabilities which the hempen bond entailed.

So strongly and metaphysically did I conceive of my situation then, that while earnestly watching his motions, I seemed distinctly to perceive that my own individuality was now merged in a joint stock company of two; that my free will had received a mortal wound; and that another’s mistake or misfortune might plunge innocent me into unmerited disaster and death. Therefore, I saw that here was a sort of interregnum in Providence; for its even-handed equity never could have so gross an injustice. And yet still further pondering—while I jerked him now and then from between the whale and ship, which would threaten to jam him—still further pondering, I say, I saw that this situation of mine was the precise situation of every mortal that breathes; only, in most cases, he, one way or other, has this Siamese connexion with a plurality of other mortals. If your banker breaks, you snap; if your apothecary by mistake sends you poison in your pills, you die. True, you may say that, by exceeding caution, you may possibly escape these and the multitudinous other evil chances of life. But handle Queequeg’s monkey-rope heedfully as I would, sometimes he jerked it so, that I came very near sliding overboard. Nor could I possibly forget that, do what I would, I only had the management of one end of it.*

*The monkey-rope is found in all whalers; but it was only in the Pequod that the monkey and his holder were ever tied together. This improvement upon the original usage was introduced by no less a man than Stubb, in order to afford the imperilled harpooneer the strongest possible guarantee for the faithfulness and vigilance of his monkey-rope holder.

I have hinted that I would often jerk poor Queequeg from between the whale and the ship—where he would occasionally fall, from the incessant rolling and swaying of both. But this was not the only jamming jeopardy he was exposed to. Unappalled by the massacre made upon them during the night, the sharks now freshly and more keenly allured by the before pent blood which began to flow from the carcass—the rabid creatures swarmed round it like bees in a beehive.

And right in among those sharks was Queequeg; who often pushed them aside with his floundering feet. A thing altogether incredible were it not that attracted by such prey as a dead whale, the otherwise miscellaneously carnivorous shark will seldom touch a man.

Nevertheless, it may well be believed that since they have such a ravenous finger in the pie, it is deemed but wise to look sharp to them. Accordingly, besides the monkey-rope, with which I now and then jerked the poor fellow from too close a vicinity to the maw of what seemed a peculiarly ferocious shark—he was provided with still another protection. Suspended over the side in one of the stages, Tashtego and Daggoo continually flourished over his head a couple of keen whale-spades, wherewith they slaughtered as many sharks as they could reach. This procedure of theirs, to be sure, was very disinterested and benevolent of them. They meant Queequeg’s best happiness, I admit; but in their hasty zeal to befriend him, and from the circumstance that both he and the sharks were at times half hidden by the blood-muddled water, those indiscreet spades of theirs would come nearer amputating a leg than a tail. But poor Queequeg, I suppose, straining and gasping there with that great iron hook—poor Queequeg, I suppose, only prayed to his Yojo, and gave up his life into the hands of his gods.

Well, well, my dear comrade and twin-brother, thought I, as I drew in and then slacked off the rope to every swell of the sea—what matters it, after all? Are you not the precious image of each and all of us men in this whaling world? That unsounded ocean you gasp in, is Life; those sharks, your foes; those spades, your friends; and what between sharks and spades you are in a sad pickle and peril, poor lad.

But courage! there is good cheer in store for you, Queequeg. For now, as with blue lips and blood-shot eyes the exhausted savage at last climbs up the chains and stands all dripping and involuntarily trembling over the side; the steward advances, and with a benevolent, consolatory glance hands him—what? Some hot Cognac? No! hands him, ye gods! hands him a cup of tepid ginger and water!

“Ginger? Do I smell ginger?” suspiciously asked Stubb, coming near. “Yes, this must be ginger,” peering into the as yet untasted cup. Then standing as if incredulous for a while, he calmly walked towards the astonished steward slowly saying, “Ginger? ginger? and will you have the goodness to tell me, Mr. Dough-Boy, where lies the virtue of ginger? Ginger! is ginger the sort of fuel you use, Dough-boy, to kindle a fire in this shivering cannibal? Ginger!—what the devil is ginger? Sea-coal? firewood?—lucifer matches?—tinder?—gunpowder?—what the devil is ginger, I say, that you offer this cup to our poor Queequeg here.”

“There is some sneaking Temperance Society movement about this business,” he suddenly added, now approaching Starbuck, who had just come from forward. “Will you look at that kannakin, sir: smell of it, if you please.” Then watching the mate’s countenance, he added, “The steward, Mr. Starbuck, had the face to offer that calomel and jalap to Queequeg, there, this instant off the whale. Is the steward an apothecary, sir? and may I ask whether this is the sort of bitters by which he blows back the life into a half-drowned man?”

“I trust not,” said Starbuck, “it is poor stuff enough.”

“Aye, aye, steward,” cried Stubb, “we’ll teach you to drug a harpooneer; none of your apothecary’s medicine here; you want to poison us, do ye? You have got out insurances on our lives and want to murder us all, and pocket the proceeds, do ye?”

“It was not me,” cried Dough-Boy, “it was Aunt Charity that brought the ginger on board; and bade me never give the harpooneers any spirits, but only this ginger-jub—so she called it.”

“Ginger-jub! you gingerly rascal! take that! and run along with ye to the lockers, and get something better. I hope I do no wrong, Mr. Starbuck. It is the captain’s orders—grog for the harpooneer on a whale.”

“Enough,” replied Starbuck, “only don’t hit him again, but—”

“Oh, I never hurt when I hit, except when I hit a whale or something of that sort; and this fellow’s a weazel. What were you about saying, sir?”

“Only this: go down with him, and get what thou wantest thyself.”

When Stubb reappeared, he came with a dark flask in one hand, and a sort of tea-caddy in the other. The first contained strong spirits, and was handed to Queequeg; the second was Aunt Charity’s gift, and that was freely given to the waves.






CHAPTER 73. Stubb and Flask kill a Right Whale; and Then Have a Talk over Him.
It must be borne in mind that all this time we have a Sperm Whale’s prodigious head hanging to the Pequod’s side. But we must let it continue hanging there a while till we can get a chance to attend to it. For the present other matters press, and the best we can do now for the head, is to pray heaven the tackles may hold.

Now, during the past night and forenoon, the Pequod had gradually drifted into a sea, which, by its occasional patches of yellow brit, gave unusual tokens of the vicinity of Right Whales, a species of the Leviathan that but few supposed to be at this particular time lurking anywhere near. And though all hands commonly disdained the capture of those inferior creatures; and though the Pequod was not commissioned to cruise for them at all, and though she had passed numbers of them near the Crozetts without lowering a boat; yet now that a Sperm Whale had been brought alongside and beheaded, to the surprise of all, the announcement was made that a Right Whale should be captured that day, if opportunity offered.

Nor was this long wanting. Tall spouts were seen to leeward; and two boats, Stubb’s and Flask’s, were detached in pursuit. Pulling further and further away, they at last became almost invisible to the men at the mast-head. But suddenly in the distance, they saw a great heap of tumultuous white water, and soon after news came from aloft that one or both the boats must be fast. An interval passed and the boats were in plain sight, in the act of being dragged right towards the ship by the towing whale. So close did the monster come to the hull, that at first it seemed as if he meant it malice; but suddenly going down in a maelstrom, within three rods of the planks, he wholly disappeared from view, as if diving under the keel. “Cut, cut!” was the cry from the ship to the boats, which, for one instant, seemed on the point of being brought with a deadly dash against the vessel’s side. But having plenty of line yet in the tubs, and the whale not sounding very rapidly, they paid out abundance of rope, and at the same time pulled with all their might so as to get ahead of the ship. For a few minutes the struggle was intensely critical; for while they still slacked out the tightened line in one direction, and still plied their oars in another, the contending strain threatened to take them under. But it was only a few feet advance they sought to gain. And they stuck to it till they did gain it; when instantly, a swift tremor was felt running like lightning along the keel, as the strained line, scraping beneath the ship, suddenly rose to view under her bows, snapping and quivering; and so flinging off its drippings, that the drops fell like bits of broken glass on the water, while the whale beyond also rose to sight, and once more the boats were free to fly. But the fagged whale abated his speed, and blindly altering his course, went round the stern of the ship towing the two boats after him, so that they performed a complete circuit.

Meantime, they hauled more and more upon their lines, till close flanking him on both sides, Stubb answered Flask with lance for lance; and thus round and round the Pequod the battle went, while the multitudes of sharks that had before swum round the Sperm Whale’s body, rushed to the fresh blood that was spilled, thirstily drinking at every new gash, as the eager Israelites did at the new bursting fountains that poured from the smitten rock.

At last his spout grew thick, and with a frightful roll and vomit, he turned upon his back a corpse.

While the two headsmen were engaged in making fast cords to his flukes, and in other ways getting the mass in readiness for towing, some conversation ensued between them.

“I wonder what the old man wants with this lump of foul lard,” said Stubb, not without some disgust at the thought of having to do with so ignoble a leviathan.

“Wants with it?” said Flask, coiling some spare line in the boat’s bow, “did you never hear that the ship which but once has a Sperm Whale’s head hoisted on her starboard side, and at the same time a Right Whale’s on the larboard; did you never hear, Stubb, that that ship can never afterwards capsize?”

“Why not?

“I don’t know, but I heard that gamboge ghost of a Fedallah saying so, and he seems to know all about ships’ charms. But I sometimes think he’ll charm the ship to no good at last. I don’t half like that chap, Stubb. Did you ever notice how that tusk of his is a sort of carved into a snake’s head, Stubb?”

“Sink him! I never look at him at all; but if ever I get a chance of a dark night, and he standing hard by the bulwarks, and no one by; look down there, Flask”—pointing into the sea with a peculiar motion of both hands—“Aye, will I! Flask, I take that Fedallah to be the devil in disguise. Do you believe that cock and bull story about his having been stowed away on board ship? He’s the devil, I say. The reason why you don’t see his tail, is because he tucks it up out of sight; he carries it coiled away in his pocket, I guess. Blast him! now that I think of it, he’s always wanting oakum to stuff into the toes of his boots.”

“He sleeps in his boots, don’t he? He hasn’t got any hammock; but I’ve seen him lay of nights in a coil of rigging.”

“No doubt, and it’s because of his cursed tail; he coils it down, do ye see, in the eye of the rigging.”

“What’s the old man have so much to do with him for?”

“Striking up a swap or a bargain, I suppose.”

“Bargain?—about what?”

“Why, do ye see, the old man is hard bent after that White Whale, and the devil there is trying to come round him, and get him to swap away his silver watch, or his soul, or something of that sort, and then he’ll surrender Moby Dick.”

“Pooh! Stubb, you are skylarking; how can Fedallah do that?”

“I don’t know, Flask, but the devil is a curious chap, and a wicked one, I tell ye. Why, they say as how he went a sauntering into the old flag-ship once, switching his tail about devilish easy and gentlemanlike, and inquiring if the old governor was at home. Well, he was at home, and asked the devil what he wanted. The devil, switching his hoofs, up and says, ‘I want John.’ ‘What for?’ says the old governor. ‘What business is that of yours,’ says the devil, getting mad,—‘I want to use him.’ ‘Take him,’ says the governor—and by the Lord, Flask, if the devil didn’t give John the Asiatic cholera before he got through with him, I’ll eat this whale in one mouthful. But look sharp—ain’t you all ready there? Well, then, pull ahead, and let’s get the whale alongside.”

“I think I remember some such story as you were telling,” said Flask, when at last the two boats were slowly advancing with their burden towards the ship, “but I can’t remember where.”

“Three Spaniards? Adventures of those three bloody-minded soldadoes? Did ye read it there, Flask? I guess ye did?”

“No: never saw such a book; heard of it, though. But now, tell me, Stubb, do you suppose that that devil you was speaking of just now, was the same you say is now on board the Pequod?”

“Am I the same man that helped kill this whale? Doesn’t the devil live for ever; who ever heard that the devil was dead? Did you ever see any parson a wearing mourning for the devil? And if the devil has a latch-key to get into the admiral’s cabin, don’t you suppose he can crawl into a porthole? Tell me that, Mr. Flask?”

“How old do you suppose Fedallah is, Stubb?”

“Do you see that mainmast there?” pointing to the ship; “well, that’s the figure one; now take all the hoops in the Pequod’s hold, and string along in a row with that mast, for oughts, do you see; well, that wouldn’t begin to be Fedallah’s age. Nor all the coopers in creation couldn’t show hoops enough to make oughts enough.”

“But see here, Stubb, I thought you a little boasted just now, that you meant to give Fedallah a sea-toss, if you got a good chance. Now, if he’s so old as all those hoops of yours come to, and if he is going to live for ever, what good will it do to pitch him overboard—tell me that?

“Give him a good ducking, anyhow.”

“But he’d crawl back.”

“Duck him again; and keep ducking him.”

“Suppose he should take it into his head to duck you, though—yes, and drown you—what then?”

“I should like to see him try it; I’d give him such a pair of black eyes that he wouldn’t dare to show his face in the admiral’s cabin again for a long while, let alone down in the orlop there, where he lives, and hereabouts on the upper decks where he sneaks so much. Damn the devil, Flask; so you suppose I’m afraid of the devil? Who’s afraid of him, except the old governor who daresn’t catch him and put him in double-darbies, as he deserves, but lets him go about kidnapping people; aye, and signed a bond with him, that all the people the devil kidnapped, he’d roast for him? There’s a governor!”

“Do you suppose Fedallah wants to kidnap Captain Ahab?”

“Do I suppose it? You’ll know it before long, Flask. But I am going now to keep a sharp look-out on him; and if I see anything very suspicious going on, I’ll just take him by the nape of his neck, and say—Look here, Beelzebub, you don’t do it; and if he makes any fuss, by the Lord I’ll make a grab into his pocket for his tail, take it to the capstan, and give him such a wrenching and heaving, that his tail will come short off at the stump—do you see; and then, I rather guess when he finds himself docked in that queer fashion, he’ll sneak off without the poor satisfaction of feeling his tail between his legs.”

“And what will you do with the tail, Stubb?”

“Do with it? Sell it for an ox whip when we get home;—what else?”

“Now, do you mean what you say, and have been saying all along, Stubb?”

“Mean or not mean, here we are at the ship.”

The boats were here hailed, to tow the whale on the larboard side, where fluke chains and other necessaries were already prepared for securing him.

“Didn’t I tell you so?” said Flask; “yes, you’ll soon see this right whale’s head hoisted up opposite that parmacetti’s.”

In good time, Flask’s saying proved true. As before, the Pequod steeply leaned over towards the sperm whale’s head, now, by the counterpoise of both heads, she regained her even keel; though sorely strained, you may well believe. So, when on one side you hoist in Locke’s head, you go over that way; but now, on the other side, hoist in Kant’s and you come back again; but in very poor plight. Thus, some minds for ever keep trimming boat. Oh, ye foolish! throw all these thunder-heads overboard, and then you will float light and right.

In disposing of the body of a right whale, when brought alongside the ship, the same preliminary proceedings commonly take place as in the case of a sperm whale; only, in the latter instance, the head is cut off whole, but in the former the lips and tongue are separately removed and hoisted on deck, with all the well known black bone attached to what is called the crown-piece. But nothing like this, in the present case, had been done. The carcases of both whales had dropped astern; and the head-laden ship not a little resembled a mule carrying a pair of overburdening panniers.

Meantime, Fedallah was calmly eyeing the right whale’s head, and ever and anon glancing from the deep wrinkles there to the lines in his own hand. And Ahab chanced so to stand, that the Parsee occupied his shadow; while, if the Parsee’s shadow was there at all it seemed only to blend with, and lengthen Ahab’s. As the crew toiled on, Laplandish speculations were bandied among them, concerning all these passing things.






CHAPTER 74. The Sperm Whale’s Head—Contrasted View.
Here, now, are two great whales, laying their heads together; let us join them, and lay together our own.

Of the grand order of folio leviathans, the Sperm Whale and the Right Whale are by far the most noteworthy. They are the only whales regularly hunted by man. To the Nantucketer, they present the two extremes of all the known varieties of the whale. As the external difference between them is mainly observable in their heads; and as a head of each is this moment hanging from the Pequod’s side; and as we may freely go from one to the other, by merely stepping across the deck:—where, I should like to know, will you obtain a better chance to study practical cetology than here?

In the first place, you are struck by the general contrast between these heads. Both are massive enough in all conscience; but there is a certain mathematical symmetry in the Sperm Whale’s which the Right Whale’s sadly lacks. There is more character in the Sperm Whale’s head. As you behold it, you involuntarily yield the immense superiority to him, in point of pervading dignity. In the present instance, too, this dignity is heightened by the pepper and salt colour of his head at the summit, giving token of advanced age and large experience. In short, he is what the fishermen technically call a “grey-headed whale.”

Let us now note what is least dissimilar in these heads—namely, the two most important organs, the eye and the ear. Far back on the side of the head, and low down, near the angle of either whale’s jaw, if you narrowly search, you will at last see a lashless eye, which you would fancy to be a young colt’s eye; so out of all proportion is it to the magnitude of the head.

Now, from this peculiar sideway position of the whale’s eyes, it is plain that he can never see an object which is exactly ahead, no more than he can one exactly astern. In a word, the position of the whale’s eyes corresponds to that of a man’s ears; and you may fancy, for yourself, how it would fare with you, did you sideways survey objects through your ears. You would find that you could only command some thirty degrees of vision in advance of the straight side-line of sight; and about thirty more behind it. If your bitterest foe were walking straight towards you, with dagger uplifted in broad day, you would not be able to see him, any more than if he were stealing upon you from behind. In a word, you would have two backs, so to speak; but, at the same time, also, two fronts (side fronts): for what is it that makes the front of a man—what, indeed, but his eyes?

Moreover, while in most other animals that I can now think of, the eyes are so planted as imperceptibly to blend their visual power, so as to produce one picture and not two to the brain; the peculiar position of the whale’s eyes, effectually divided as they are by many cubic feet of solid head, which towers between them like a great mountain separating two lakes in valleys; this, of course, must wholly separate the impressions which each independent organ imparts. The whale, therefore, must see one distinct picture on this side, and another distinct picture on that side; while all between must be profound darkness and nothingness to him. Man may, in effect, be said to look out on the world from a sentry-box with two joined sashes for his window. But with the whale, these two sashes are separately inserted, making two distinct windows, but sadly impairing the view. This peculiarity of the whale’s eyes is a thing always to be borne in mind in the fishery; and to be remembered by the reader in some subsequent scenes.

A curious and most puzzling question might be started concerning this visual matter as touching the Leviathan. But I must be content with a hint. So long as a man’s eyes are open in the light, the act of seeing is involuntary; that is, he cannot then help mechanically seeing whatever objects are before him. Nevertheless, any one’s experience will teach him, that though he can take in an undiscriminating sweep of things at one glance, it is quite impossible for him, attentively, and completely, to examine any two things—however large or however small—at one and the same instant of time; never mind if they lie side by side and touch each other. But if you now come to separate these two objects, and surround each by a circle of profound darkness; then, in order to see one of them, in such a manner as to bring your mind to bear on it, the other will be utterly excluded from your contemporary consciousness. How is it, then, with the whale? True, both his eyes, in themselves, must simultaneously act; but is his brain so much more comprehensive, combining, and subtle than man’s, that he can at the same moment of time attentively examine two distinct prospects, one on one side of him, and the other in an exactly opposite direction? If he can, then is it as marvellous a thing in him, as if a man were able simultaneously to go through the demonstrations of two distinct problems in Euclid. Nor, strictly investigated, is there any incongruity in this comparison.

It may be but an idle whim, but it has always seemed to me, that the extraordinary vacillations of movement displayed by some whales when beset by three or four boats; the timidity and liability to queer frights, so common to such whales; I think that all this indirectly proceeds from the helpless perplexity of volition, in which their divided and diametrically opposite powers of vision must involve them.

But the ear of the whale is full as curious as the eye. If you are an entire stranger to their race, you might hunt over these two heads for hours, and never discover that organ. The ear has no external leaf whatever; and into the hole itself you can hardly insert a quill, so wondrously minute is it. It is lodged a little behind the eye. With respect to their ears, this important difference is to be observed between the sperm whale and the right. While the ear of the former has an external opening, that of the latter is entirely and evenly covered over with a membrane, so as to be quite imperceptible from without.

Is it not curious, that so vast a being as the whale should see the world through so small an eye, and hear the thunder through an ear which is smaller than a hare’s? But if his eyes were broad as the lens of Herschel’s great telescope; and his ears capacious as the porches of cathedrals; would that make him any longer of sight, or sharper of hearing? Not at all.—Why then do you try to “enlarge” your mind? Subtilize it.

Let us now with whatever levers and steam-engines we have at hand, cant over the sperm whale’s head, that it may lie bottom up; then, ascending by a ladder to the summit, have a peep down the mouth; and were it not that the body is now completely separated from it, with a lantern we might descend into the great Kentucky Mammoth Cave of his stomach. But let us hold on here by this tooth, and look about us where we are. What a really beautiful and chaste-looking mouth! from floor to ceiling, lined, or rather papered with a glistening white membrane, glossy as bridal satins.

But come out now, and look at this portentous lower jaw, which seems like the long narrow lid of an immense snuff-box, with the hinge at one end, instead of one side. If you pry it up, so as to get it overhead, and expose its rows of teeth, it seems a terrific portcullis; and such, alas! it proves to many a poor wight in the fishery, upon whom these spikes fall with impaling force. But far more terrible is it to behold, when fathoms down in the sea, you see some sulky whale, floating there suspended, with his prodigious jaw, some fifteen feet long, hanging straight down at right-angles with his body, for all the world like a ship’s jib-boom. This whale is not dead; he is only dispirited; out of sorts, perhaps; hypochondriac; and so supine, that the hinges of his jaw have relaxed, leaving him there in that ungainly sort of plight, a reproach to all his tribe, who must, no doubt, imprecate lock-jaws upon him.

In most cases this lower jaw—being easily unhinged by a practised artist—is disengaged and hoisted on deck for the purpose of extracting the ivory teeth, and furnishing a supply of that hard white whalebone with which the fishermen fashion all sorts of curious articles, including canes, umbrella-stocks, and handles to riding-whips.

With a long, weary hoist the jaw is dragged on board, as if it were an anchor; and when the proper time comes—some few days after the other work—Queequeg, Daggoo, and Tashtego, being all accomplished dentists, are set to drawing teeth. With a keen cutting-spade, Queequeg lances the gums; then the jaw is lashed down to ringbolts, and a tackle being rigged from aloft, they drag out these teeth, as Michigan oxen drag stumps of old oaks out of wild wood lands. There are generally forty-two teeth in all; in old whales, much worn down, but undecayed; nor filled after our artificial fashion. The jaw is afterwards sawn into slabs, and piled away like joists for building houses.






CHAPTER 75. The Right Whale’s Head—Contrasted View.
Crossing the deck, let us now have a good long look at the Right Whale’s head.

As in general shape the noble Sperm Whale’s head may be compared to a Roman war-chariot (especially in front, where it is so broadly rounded); so, at a broad view, the Right Whale’s head bears a rather inelegant resemblance to a gigantic galliot-toed shoe. Two hundred years ago an old Dutch voyager likened its shape to that of a shoemaker’s last. And in this same last or shoe, that old woman of the nursery tale, with the swarming brood, might very comfortably be lodged, she and all her progeny.

But as you come nearer to this great head it begins to assume different aspects, according to your point of view. If you stand on its summit and look at these two F-shaped spoutholes, you would take the whole head for an enormous bass-viol, and these spiracles, the apertures in its sounding-board. Then, again, if you fix your eye upon this strange, crested, comb-like incrustation on the top of the mass—this green, barnacled thing, which the Greenlanders call the “crown,” and the Southern fishers the “bonnet” of the Right Whale; fixing your eyes solely on this, you would take the head for the trunk of some huge oak, with a bird’s nest in its crotch. At any rate, when you watch those live crabs that nestle here on this bonnet, such an idea will be almost sure to occur to you; unless, indeed, your fancy has been fixed by the technical term “crown” also bestowed upon it; in which case you will take great interest in thinking how this mighty monster is actually a diademed king of the sea, whose green crown has been put together for him in this marvellous manner. But if this whale be a king, he is a very sulky looking fellow to grace a diadem. Look at that hanging lower lip! what a huge sulk and pout is there! a sulk and pout, by carpenter’s measurement, about twenty feet long and five feet deep; a sulk and pout that will yield you some 500 gallons of oil and more.

A great pity, now, that this unfortunate whale should be hare-lipped. The fissure is about a foot across. Probably the mother during an important interval was sailing down the Peruvian coast, when earthquakes caused the beach to gape. Over this lip, as over a slippery threshold, we now slide into the mouth. Upon my word were I at Mackinaw, I should take this to be the inside of an Indian wigwam. Good Lord! is this the road that Jonah went? The roof is about twelve feet high, and runs to a pretty sharp angle, as if there were a regular ridge-pole there; while these ribbed, arched, hairy sides, present us with those wondrous, half vertical, scimetar-shaped slats of whalebone, say three hundred on a side, which depending from the upper part of the head or crown bone, form those Venetian blinds which have elsewhere been cursorily mentioned. The edges of these bones are fringed with hairy fibres, through which the Right Whale strains the water, and in whose intricacies he retains the small fish, when openmouthed he goes through the seas of brit in feeding time. In the central blinds of bone, as they stand in their natural order, there are certain curious marks, curves, hollows, and ridges, whereby some whalemen calculate the creature’s age, as the age of an oak by its circular rings. Though the certainty of this criterion is far from demonstrable, yet it has the savor of analogical probability. At any rate, if we yield to it, we must grant a far greater age to the Right Whale than at first glance will seem reasonable.

In old times, there seem to have prevailed the most curious fancies concerning these blinds. One voyager in Purchas calls them the wondrous “whiskers” inside of the whale’s mouth;* another, “hogs’ bristles”; a third old gentleman in Hackluyt uses the following elegant language: “There are about two hundred and fifty fins growing on each side of his upper chop, which arch over his tongue on each side of his mouth.”

*This reminds us that the Right Whale really has a sort of whisker, or rather a moustache, consisting of a few scattered white hairs on the upper part of the outer end of the lower jaw. Sometimes these tufts impart a rather brigandish expression to his otherwise solemn countenance.

As every one knows, these same “hogs’ bristles,” “fins,” “whiskers,” “blinds,” or whatever you please, furnish to the ladies their busks and other stiffening contrivances. But in this particular, the demand has long been on the decline. It was in Queen Anne’s time that the bone was in its glory, the farthingale being then all the fashion. And as those ancient dames moved about gaily, though in the jaws of the whale, as you may say; even so, in a shower, with the like thoughtlessness, do we nowadays fly under the same jaws for protection; the umbrella being a tent spread over the same bone.

But now forget all about blinds and whiskers for a moment, and, standing in the Right Whale’s mouth, look around you afresh. Seeing all these colonnades of bone so methodically ranged about, would you not think you were inside of the great Haarlem organ, and gazing upon its thousand pipes? For a carpet to the organ we have a rug of the softest Turkey—the tongue, which is glued, as it were, to the floor of the mouth. It is very fat and tender, and apt to tear in pieces in hoisting it on deck. This particular tongue now before us; at a passing glance I should say it was a six-barreler; that is, it will yield you about that amount of oil.

Ere this, you must have plainly seen the truth of what I started with—that the Sperm Whale and the Right Whale have almost entirely different heads. To sum up, then: in the Right Whale’s there is no great well of sperm; no ivory teeth at all; no long, slender mandible of a lower jaw, like the Sperm Whale’s. Nor in the Sperm Whale are there any of those blinds of bone; no huge lower lip; and scarcely anything of a tongue. Again, the Right Whale has two external spout-holes, the Sperm Whale only one.

Look your last, now, on these venerable hooded heads, while they yet lie together; for one will soon sink, unrecorded, in the sea; the other will not be very long in following.

Can you catch the expression of the Sperm Whale’s there? It is the same he died with, only some of the longer wrinkles in the forehead seem now faded away. I think his broad brow to be full of a prairie-like placidity, born of a speculative indifference as to death. But mark the other head’s expression. See that amazing lower lip, pressed by accident against the vessel’s side, so as firmly to embrace the jaw. Does not this whole head seem to speak of an enormous practical resolution in facing death? This Right Whale I take to have been a Stoic; the Sperm Whale, a Platonian, who might have taken up Spinoza in his latter years.






CHAPTER 76. The Battering-Ram.
Ere quitting, for the nonce, the Sperm Whale’s head, I would have you, as a sensible physiologist, simply—particularly remark its front aspect, in all its compacted collectedness. I would have you investigate it now with the sole view of forming to yourself some unexaggerated, intelligent estimate of whatever battering-ram power may be lodged there. Here is a vital point; for you must either satisfactorily settle this matter with yourself, or for ever remain an infidel as to one of the most appalling, but not the less true events, perhaps anywhere to be found in all recorded history.

You observe that in the ordinary swimming position of the Sperm Whale, the front of his head presents an almost wholly vertical plane to the water; you observe that the lower part of that front slopes considerably backwards, so as to furnish more of a retreat for the long socket which receives the boom-like lower jaw; you observe that the mouth is entirely under the head, much in the same way, indeed, as though your own mouth were entirely under your chin. Moreover you observe that the whale has no external nose; and that what nose he has—his spout hole—is on the top of his head; you observe that his eyes and ears are at the sides of his head, nearly one third of his entire length from the front. Wherefore, you must now have perceived that the front of the Sperm Whale’s head is a dead, blind wall, without a single organ or tender prominence of any sort whatsoever. Furthermore, you are now to consider that only in the extreme, lower, backward sloping part of the front of the head, is there the slightest vestige of bone; and not till you get near twenty feet from the forehead do you come to the full cranial development. So that this whole enormous boneless mass is as one wad. Finally, though, as will soon be revealed, its contents partly comprise the most delicate oil; yet, you are now to be apprised of the nature of the substance which so impregnably invests all that apparent effeminacy. In some previous place I have described to you how the blubber wraps the body of the whale, as the rind wraps an orange. Just so with the head; but with this difference: about the head this envelope, though not so thick, is of a boneless toughness, inestimable by any man who has not handled it. The severest pointed harpoon, the sharpest lance darted by the strongest human arm, impotently rebounds from it. It is as though the forehead of the Sperm Whale were paved with horses’ hoofs. I do not think that any sensation lurks in it.

Bethink yourself also of another thing. When two large, loaded Indiamen chance to crowd and crush towards each other in the docks, what do the sailors do? They do not suspend between them, at the point of coming contact, any merely hard substance, like iron or wood. No, they hold there a large, round wad of tow and cork, enveloped in the thickest and toughest of ox-hide. That bravely and uninjured takes the jam which would have snapped all their oaken handspikes and iron crow-bars. By itself this sufficiently illustrates the obvious fact I drive at. But supplementary to this, it has hypothetically occurred to me, that as ordinary fish possess what is called a swimming bladder in them, capable, at will, of distension or contraction; and as the Sperm Whale, as far as I know, has no such provision in him; considering, too, the otherwise inexplicable manner in which he now depresses his head altogether beneath the surface, and anon swims with it high elevated out of the water; considering the unobstructed elasticity of its envelope; considering the unique interior of his head; it has hypothetically occurred to me, I say, that those mystical lung-celled honeycombs there may possibly have some hitherto unknown and unsuspected connexion with the outer air, so as to be susceptible to atmospheric distension and contraction. If this be so, fancy the irresistibleness of that might, to which the most impalpable and destructive of all elements contributes.

Now, mark. Unerringly impelling this dead, impregnable, uninjurable wall, and this most buoyant thing within; there swims behind it all a mass of tremendous life, only to be adequately estimated as piled wood is—by the cord; and all obedient to one volition, as the smallest insect. So that when I shall hereafter detail to you all the specialities and concentrations of potency everywhere lurking in this expansive monster; when I shall show you some of his more inconsiderable braining feats; I trust you will have renounced all ignorant incredulity, and be ready to abide by this; that though the Sperm Whale stove a passage through the Isthmus of Darien, and mixed the Atlantic with the Pacific, you would not elevate one hair of your eye-brow. For unless you own the whale, you are but a provincial and sentimentalist in Truth. But clear Truth is a thing for salamander giants only to encounter; how small the chances for the provincials then? What befell the weakling youth lifting the dread goddess’s veil at Lais?






CHAPTER 77. The Great Heidelburgh Tun.
Now comes the Baling of the Case. But to comprehend it aright, you must know something of the curious internal structure of the thing operated upon.

Regarding the Sperm Whale’s head as a solid oblong, you may, on an inclined plane, sideways divide it into two quoins,* whereof the lower is the bony structure, forming the cranium and jaws, and the upper an unctuous mass wholly free from bones; its broad forward end forming the expanded vertical apparent forehead of the whale. At the middle of the forehead horizontally subdivide this upper quoin, and then you have two almost equal parts, which before were naturally divided by an internal wall of a thick tendinous substance.

*Quoin is not a Euclidean term. It belongs to the pure nautical mathematics. I know not that it has been defined before. A quoin is a solid which differs from a wedge in having its sharp end formed by the steep inclination of one side, instead of the mutual tapering of both sides.

The lower subdivided part, called the junk, is one immense honeycomb of oil, formed by the crossing and recrossing, into ten thousand infiltrated cells, of tough elastic white fibres throughout its whole extent. The upper part, known as the Case, may be regarded as the great Heidelburgh Tun of the Sperm Whale. And as that famous great tierce is mystically carved in front, so the whale’s vast plaited forehead forms innumerable strange devices for the emblematical adornment of his wondrous tun. Moreover, as that of Heidelburgh was always replenished with the most excellent of the wines of the Rhenish valleys, so the tun of the whale contains by far the most precious of all his oily vintages; namely, the highly-prized spermaceti, in its absolutely pure, limpid, and odoriferous state. Nor is this precious substance found unalloyed in any other part of the creature. Though in life it remains perfectly fluid, yet, upon exposure to the air, after death, it soon begins to concrete; sending forth beautiful crystalline shoots, as when the first thin delicate ice is just forming in water. A large whale’s case generally yields about five hundred gallons of sperm, though from unavoidable circumstances, considerable of it is spilled, leaks, and dribbles away, or is otherwise irrevocably lost in the ticklish business of securing what you can.

I know not with what fine and costly material the Heidelburgh Tun was coated within, but in superlative richness that coating could not possibly have compared with the silken pearl-coloured membrane, like the lining of a fine pelisse, forming the inner surface of the Sperm Whale’s case.

It will have been seen that the Heidelburgh Tun of the Sperm Whale embraces the entire length of the entire top of the head; and since—as has been elsewhere set forth—the head embraces one third of the whole length of the creature, then setting that length down at eighty feet for a good sized whale, you have more than twenty-six feet for the depth of the tun, when it is lengthwise hoisted up and down against a ship’s side.

As in decapitating the whale, the operator’s instrument is brought close to the spot where an entrance is subsequently forced into the spermaceti magazine; he has, therefore, to be uncommonly heedful, lest a careless, untimely stroke should invade the sanctuary and wastingly let out its invaluable contents. It is this decapitated end of the head, also, which is at last elevated out of the water, and retained in that position by the enormous cutting tackles, whose hempen combinations, on one side, make quite a wilderness of ropes in that quarter.

Thus much being said, attend now, I pray you, to that marvellous and—in this particular instance—almost fatal operation whereby the Sperm Whale’s great Heidelburgh Tun is tapped.






CHAPTER 78. Cistern and Buckets.
Nimble as a cat, Tashtego mounts aloft; and without altering his erect posture, runs straight out upon the overhanging mainyard-arm, to the part where it exactly projects over the hoisted Tun. He has carried with him a light tackle called a whip, consisting of only two parts, travelling through a single-sheaved block. Securing this block, so that it hangs down from the yard-arm, he swings one end of the rope, till it is caught and firmly held by a hand on deck. Then, hand-over-hand, down the other part, the Indian drops through the air, till dexterously he lands on the summit of the head. There—still high elevated above the rest of the company, to whom he vivaciously cries—he seems some Turkish Muezzin calling the good people to prayers from the top of a tower. A short-handled sharp spade being sent up to him, he diligently searches for the proper place to begin breaking into the Tun. In this business he proceeds very heedfully, like a treasure-hunter in some old house, sounding the walls to find where the gold is masoned in. By the time this cautious search is over, a stout iron-bound bucket, precisely like a well-bucket, has been attached to one end of the whip; while the other end, being stretched across the deck, is there held by two or three alert hands. These last now hoist the bucket within grasp of the Indian, to whom another person has reached up a very long pole. Inserting this pole into the bucket, Tashtego downward guides the bucket into the Tun, till it entirely disappears; then giving the word to the seamen at the whip, up comes the bucket again, all bubbling like a dairy-maid’s pail of new milk. Carefully lowered from its height, the full-freighted vessel is caught by an appointed hand, and quickly emptied into a large tub. Then remounting aloft, it again goes through the same round until the deep cistern will yield no more. Towards the end, Tashtego has to ram his long pole harder and harder, and deeper and deeper into the Tun, until some twenty feet of the pole have gone down.

Now, the people of the Pequod had been baling some time in this way; several tubs had been filled with the fragrant sperm; when all at once a queer accident happened. Whether it was that Tashtego, that wild Indian, was so heedless and reckless as to let go for a moment his one-handed hold on the great cabled tackles suspending the head; or whether the place where he stood was so treacherous and oozy; or whether the Evil One himself would have it to fall out so, without stating his particular reasons; how it was exactly, there is no telling now; but, on a sudden, as the eightieth or ninetieth bucket came suckingly up—my God! poor Tashtego—like the twin reciprocating bucket in a veritable well, dropped head-foremost down into this great Tun of Heidelburgh, and with a horrible oily gurgling, went clean out of sight!

“Man overboard!” cried Daggoo, who amid the general consternation first came to his senses. “Swing the bucket this way!” and putting one foot into it, so as the better to secure his slippery hand-hold on the whip itself, the hoisters ran him high up to the top of the head, almost before Tashtego could have reached its interior bottom. Meantime, there was a terrible tumult. Looking over the side, they saw the before lifeless head throbbing and heaving just below the surface of the sea, as if that moment seized with some momentous idea; whereas it was only the poor Indian unconsciously revealing by those struggles the perilous depth to which he had sunk.

At this instant, while Daggoo, on the summit of the head, was clearing the whip—which had somehow got foul of the great cutting tackles—a sharp cracking noise was heard; and to the unspeakable horror of all, one of the two enormous hooks suspending the head tore out, and with a vast vibration the enormous mass sideways swung, till the drunk ship reeled and shook as if smitten by an iceberg. The one remaining hook, upon which the entire strain now depended, seemed every instant to be on the point of giving way; an event still more likely from the violent motions of the head.

“Come down, come down!” yelled the seamen to Daggoo, but with one hand holding on to the heavy tackles, so that if the head should drop, he would still remain suspended; the negro having cleared the foul line, rammed down the bucket into the now collapsed well, meaning that the buried harpooneer should grasp it, and so be hoisted out.

“In heaven’s name, man,” cried Stubb, “are you ramming home a cartridge there?—Avast! How will that help him; jamming that iron-bound bucket on top of his head? Avast, will ye!”

“Stand clear of the tackle!” cried a voice like the bursting of a rocket.

Almost in the same instant, with a thunder-boom, the enormous mass dropped into the sea, like Niagara’s Table-Rock into the whirlpool; the suddenly relieved hull rolled away from it, to far down her glittering copper; and all caught their breath, as half swinging—now over the sailors’ heads, and now over the water—Daggoo, through a thick mist of spray, was dimly beheld clinging to the pendulous tackles, while poor, buried-alive Tashtego was sinking utterly down to the bottom of the sea! But hardly had the blinding vapor cleared away, when a naked figure with a boarding-sword in his hand, was for one swift moment seen hovering over the bulwarks. The next, a loud splash announced that my brave Queequeg had dived to the rescue. One packed rush was made to the side, and every eye counted every ripple, as moment followed moment, and no sign of either the sinker or the diver could be seen. Some hands now jumped into a boat alongside, and pushed a little off from the ship.

“Ha! ha!” cried Daggoo, all at once, from his now quiet, swinging perch overhead; and looking further off from the side, we saw an arm thrust upright from the blue waves; a sight strange to see, as an arm thrust forth from the grass over a grave.

“Both! both!—it is both!”—cried Daggoo again with a joyful shout; and soon after, Queequeg was seen boldly striking out with one hand, and with the other clutching the long hair of the Indian. Drawn into the waiting boat, they were quickly brought to the deck; but Tashtego was long in coming to, and Queequeg did not look very brisk.

Now, how had this noble rescue been accomplished? Why, diving after the slowly descending head, Queequeg with his keen sword had made side lunges near its bottom, so as to scuttle a large hole there; then dropping his sword, had thrust his long arm far inwards and upwards, and so hauled out poor Tash by the head. He averred, that upon first thrusting in for him, a leg was presented; but well knowing that that was not as it ought to be, and might occasion great trouble;—he had thrust back the leg, and by a dexterous heave and toss, had wrought a somerset upon the Indian; so that with the next trial, he came forth in the good old way—head foremost. As for the great head itself, that was doing as well as could be expected.

And thus, through the courage and great skill in obstetrics of Queequeg, the deliverance, or rather, delivery of Tashtego, was successfully accomplished, in the teeth, too, of the most untoward and apparently hopeless impediments; which is a lesson by no means to be forgotten. Midwifery should be taught in the same course with fencing and boxing, riding and rowing.

I know that this queer adventure of the Gay-Header’s will be sure to seem incredible to some landsmen, though they themselves may have either seen or heard of some one’s falling into a cistern ashore; an accident which not seldom happens, and with much less reason too than the Indian’s, considering the exceeding slipperiness of the curb of the Sperm Whale’s well.

But, peradventure, it may be sagaciously urged, how is this? We thought the tissued, infiltrated head of the Sperm Whale, was the lightest and most corky part about him; and yet thou makest it sink in an element of a far greater specific gravity than itself. We have thee there. Not at all, but I have ye; for at the time poor Tash fell in, the case had been nearly emptied of its lighter contents, leaving little but the dense tendinous wall of the well—a double welded, hammered substance, as I have before said, much heavier than the sea water, and a lump of which sinks in it like lead almost. But the tendency to rapid sinking in this substance was in the present instance materially counteracted by the other parts of the head remaining undetached from it, so that it sank very slowly and deliberately indeed, affording Queequeg a fair chance for performing his agile obstetrics on the run, as you may say. Yes, it was a running delivery, so it was.

Now, had Tashtego perished in that head, it had been a very precious perishing; smothered in the very whitest and daintiest of fragrant spermaceti; coffined, hearsed, and tombed in the secret inner chamber and sanctum sanctorum of the whale. Only one sweeter end can readily be recalled—the delicious death of an Ohio honey-hunter, who seeking honey in the crotch of a hollow tree, found such exceeding store of it, that leaning too far over, it sucked him in, so that he died embalmed. How many, think ye, have likewise fallen into Plato’s honey head, and sweetly perished there?






CHAPTER 79. The Prairie.
To scan the lines of his face, or feel the bumps on the head of this Leviathan; this is a thing which no Physiognomist or Phrenologist has as yet undertaken. Such an enterprise would seem almost as hopeful as for Lavater to have scrutinized the wrinkles on the Rock of Gibraltar, or for Gall to have mounted a ladder and manipulated the Dome of the Pantheon. Still, in that famous work of his, Lavater not only treats of the various faces of men, but also attentively studies the faces of horses, birds, serpents, and fish; and dwells in detail upon the modifications of expression discernible therein. Nor have Gall and his disciple Spurzheim failed to throw out some hints touching the phrenological characteristics of other beings than man. Therefore, though I am but ill qualified for a pioneer, in the application of these two semi-sciences to the whale, I will do my endeavor. I try all things; I achieve what I can.

Physiognomically regarded, the Sperm Whale is an anomalous creature. He has no proper nose. And since the nose is the central and most conspicuous of the features; and since it perhaps most modifies and finally controls their combined expression; hence it would seem that its entire absence, as an external appendage, must very largely affect the countenance of the whale. For as in landscape gardening, a spire, cupola, monument, or tower of some sort, is deemed almost indispensable to the completion of the scene; so no face can be physiognomically in keeping without the elevated open-work belfry of the nose. Dash the nose from Phidias’s marble Jove, and what a sorry remainder! Nevertheless, Leviathan is of so mighty a magnitude, all his proportions are so stately, that the same deficiency which in the sculptured Jove were hideous, in him is no blemish at all. Nay, it is an added grandeur. A nose to the whale would have been impertinent. As on your physiognomical voyage you sail round his vast head in your jolly-boat, your noble conceptions of him are never insulted by the reflection that he has a nose to be pulled. A pestilent conceit, which so often will insist upon obtruding even when beholding the mightiest royal beadle on his throne.

In some particulars, perhaps the most imposing physiognomical view to be had of the Sperm Whale, is that of the full front of his head. This aspect is sublime.

In thought, a fine human brow is like the East when troubled with the morning. In the repose of the pasture, the curled brow of the bull has a touch of the grand in it. Pushing heavy cannon up mountain defiles, the elephant’s brow is majestic. Human or animal, the mystical brow is as that great golden seal affixed by the German emperors to their decrees. It signifies—“God: done this day by my hand.” But in most creatures, nay in man himself, very often the brow is but a mere strip of alpine land lying along the snow line. Few are the foreheads which like Shakespeare’s or Melancthon’s rise so high, and descend so low, that the eyes themselves seem clear, eternal, tideless mountain lakes; and all above them in the forehead’s wrinkles, you seem to track the antlered thoughts descending there to drink, as the Highland hunters track the snow prints of the deer. But in the great Sperm Whale, this high and mighty god-like dignity inherent in the brow is so immensely amplified, that gazing on it, in that full front view, you feel the Deity and the dread powers more forcibly than in beholding any other object in living nature. For you see no one point precisely; not one distinct feature is revealed; no nose, eyes, ears, or mouth; no face; he has none, proper; nothing but that one broad firmament of a forehead, pleated with riddles; dumbly lowering with the doom of boats, and ships, and men. Nor, in profile, does this wondrous brow diminish; though that way viewed its grandeur does not domineer upon you so. In profile, you plainly perceive that horizontal, semi-crescentic depression in the forehead’s middle, which, in man, is Lavater’s mark of genius.

But how? Genius in the Sperm Whale? Has the Sperm Whale ever written a book, spoken a speech? No, his great genius is declared in his doing nothing particular to prove it. It is moreover declared in his pyramidical silence. And this reminds me that had the great Sperm Whale been known to the young Orient World, he would have been deified by their child-magian thoughts. They deified the crocodile of the Nile, because the crocodile is tongueless; and the Sperm Whale has no tongue, or at least it is so exceedingly small, as to be incapable of protrusion. If hereafter any highly cultured, poetical nation shall lure back to their birth-right, the merry May-day gods of old; and livingly enthrone them again in the now egotistical sky; in the now unhaunted hill; then be sure, exalted to Jove’s high seat, the great Sperm Whale shall lord it.

Champollion deciphered the wrinkled granite hieroglyphics. But there is no Champollion to decipher the Egypt of every man’s and every being’s face. Physiognomy, like every other human science, is but a passing fable. If then, Sir William Jones, who read in thirty languages, could not read the simplest peasant’s face in its profounder and more subtle meanings, how may unlettered Ishmael hope to read the awful Chaldee of the Sperm Whale’s brow? I but put that brow before you. Read it if you can.






CHAPTER 80. The Nut.
If the Sperm Whale be physiognomically a Sphinx, to the phrenologist his brain seems that geometrical circle which it is impossible to square.

In the full-grown creature the skull will measure at least twenty feet in length. Unhinge the lower jaw, and the side view of this skull is as the side of a moderately inclined plane resting throughout on a level base. But in life—as we have elsewhere seen—this inclined plane is angularly filled up, and almost squared by the enormous superincumbent mass of the junk and sperm. At the high end the skull forms a crater to bed that part of the mass; while under the long floor of this crater—in another cavity seldom exceeding ten inches in length and as many in depth—reposes the mere handful of this monster’s brain. The brain is at least twenty feet from his apparent forehead in life; it is hidden away behind its vast outworks, like the innermost citadel within the amplified fortifications of Quebec. So like a choice casket is it secreted in him, that I have known some whalemen who peremptorily deny that the Sperm Whale has any other brain than that palpable semblance of one formed by the cubic-yards of his sperm magazine. Lying in strange folds, courses, and convolutions, to their apprehensions, it seems more in keeping with the idea of his general might to regard that mystic part of him as the seat of his intelligence.

It is plain, then, that phrenologically the head of this Leviathan, in the creature’s living intact state, is an entire delusion. As for his true brain, you can then see no indications of it, nor feel any. The whale, like all things that are mighty, wears a false brow to the common world.

If you unload his skull of its spermy heaps and then take a rear view of its rear end, which is the high end, you will be struck by its resemblance to the human skull, beheld in the same situation, and from the same point of view. Indeed, place this reversed skull (scaled down to the human magnitude) among a plate of men’s skulls, and you would involuntarily confound it with them; and remarking the depressions on one part of its summit, in phrenological phrase you would say—This man had no self-esteem, and no veneration. And by those negations, considered along with the affirmative fact of his prodigious bulk and power, you can best form to yourself the truest, though not the most exhilarating conception of what the most exalted potency is.

But if from the comparative dimensions of the whale’s proper brain, you deem it incapable of being adequately charted, then I have another idea for you. If you attentively regard almost any quadruped’s spine, you will be struck with the resemblance of its vertebræ to a strung necklace of dwarfed skulls, all bearing rudimental resemblance to the skull proper. It is a German conceit, that the vertebræ are absolutely undeveloped skulls. But the curious external resemblance, I take it the Germans were not the first men to perceive. A foreign friend once pointed it out to me, in the skeleton of a foe he had slain, and with the vertebræ of which he was inlaying, in a sort of basso-relievo, the beaked prow of his canoe. Now, I consider that the phrenologists have omitted an important thing in not pushing their investigations from the cerebellum through the spinal canal. For I believe that much of a man’s character will be found betokened in his backbone. I would rather feel your spine than your skull, whoever you are. A thin joist of a spine never yet upheld a full and noble soul. I rejoice in my spine, as in the firm audacious staff of that flag which I fling half out to the world.

Apply this spinal branch of phrenology to the Sperm Whale. His cranial cavity is continuous with the first neck-vertebra; and in that vertebra the bottom of the spinal canal will measure ten inches across, being eight in height, and of a triangular figure with the base downwards. As it passes through the remaining vertebræ the canal tapers in size, but for a considerable distance remains of large capacity. Now, of course, this canal is filled with much the same strangely fibrous substance—the spinal cord—as the brain; and directly communicates with the brain. And what is still more, for many feet after emerging from the brain’s cavity, the spinal cord remains of an undecreasing girth, almost equal to that of the brain. Under all these circumstances, would it be unreasonable to survey and map out the whale’s spine phrenologically? For, viewed in this light, the wonderful comparative smallness of his brain proper is more than compensated by the wonderful comparative magnitude of his spinal cord.

But leaving this hint to operate as it may with the phrenologists, I would merely assume the spinal theory for a moment, in reference to the Sperm Whale’s hump. This august hump, if I mistake not, rises over one of the larger vertebræ, and is, therefore, in some sort, the outer convex mould of it. From its relative situation then, I should call this high hump the organ of firmness or indomitableness in the Sperm Whale. And that the great monster is indomitable, you will yet have reason to know.






CHAPTER 81. The Pequod Meets The Virgin.
The predestinated day arrived, and we duly met the ship Jungfrau, Derick De Deer, master, of Bremen.

At one time the greatest whaling people in the world, the Dutch and Germans are now among the least; but here and there at very wide intervals of latitude and longitude, you still occasionally meet with their flag in the Pacific.

For some reason, the Jungfrau seemed quite eager to pay her respects. While yet some distance from the Pequod, she rounded to, and dropping a boat, her captain was impelled towards us, impatiently standing in the bows instead of the stern.

“What has he in his hand there?” cried Starbuck, pointing to something wavingly held by the German. “Impossible!—a lamp-feeder!”

“Not that,” said Stubb, “no, no, it’s a coffee-pot, Mr. Starbuck; he’s coming off to make us our coffee, is the Yarman; don’t you see that big tin can there alongside of him?—that’s his boiling water. Oh! he’s all right, is the Yarman.”

“Go along with you,” cried Flask, “it’s a lamp-feeder and an oil-can. He’s out of oil, and has come a-begging.”

However curious it may seem for an oil-ship to be borrowing oil on the whale-ground, and however much it may invertedly contradict the old proverb about carrying coals to Newcastle, yet sometimes such a thing really happens; and in the present case Captain Derick De Deer did indubitably conduct a lamp-feeder as Flask did declare.

As he mounted the deck, Ahab abruptly accosted him, without at all heeding what he had in his hand; but in his broken lingo, the German soon evinced his complete ignorance of the White Whale; immediately turning the conversation to his lamp-feeder and oil can, with some remarks touching his having to turn into his hammock at night in profound darkness—his last drop of Bremen oil being gone, and not a single flying-fish yet captured to supply the deficiency; concluding by hinting that his ship was indeed what in the Fishery is technically called a clean one (that is, an empty one), well deserving the name of Jungfrau or the Virgin.

His necessities supplied, Derick departed; but he had not gained his ship’s side, when whales were almost simultaneously raised from the mast-heads of both vessels; and so eager for the chase was Derick, that without pausing to put his oil-can and lamp-feeder aboard, he slewed round his boat and made after the leviathan lamp-feeders.

Now, the game having risen to leeward, he and the other three German boats that soon followed him, had considerably the start of the Pequod’s keels. There were eight whales, an average pod. Aware of their danger, they were going all abreast with great speed straight before the wind, rubbing their flanks as closely as so many spans of horses in harness. They left a great, wide wake, as though continually unrolling a great wide parchment upon the sea.

Full in this rapid wake, and many fathoms in the rear, swam a huge, humped old bull, which by his comparatively slow progress, as well as by the unusual yellowish incrustations overgrowing him, seemed afflicted with the jaundice, or some other infirmity. Whether this whale belonged to the pod in advance, seemed questionable; for it is not customary for such venerable leviathans to be at all social. Nevertheless, he stuck to their wake, though indeed their back water must have retarded him, because the white-bone or swell at his broad muzzle was a dashed one, like the swell formed when two hostile currents meet. His spout was short, slow, and laborious; coming forth with a choking sort of gush, and spending itself in torn shreds, followed by strange subterranean commotions in him, which seemed to have egress at his other buried extremity, causing the waters behind him to upbubble.

“Who’s got some paregoric?” said Stubb, “he has the stomach-ache, I’m afraid. Lord, think of having half an acre of stomach-ache! Adverse winds are holding mad Christmas in him, boys. It’s the first foul wind I ever knew to blow from astern; but look, did ever whale yaw so before? it must be, he’s lost his tiller.”

As an overladen Indiaman bearing down the Hindostan coast with a deck load of frightened horses, careens, buries, rolls, and wallows on her way; so did this old whale heave his aged bulk, and now and then partly turning over on his cumbrous rib-ends, expose the cause of his devious wake in the unnatural stump of his starboard fin. Whether he had lost that fin in battle, or had been born without it, it were hard to say.

“Only wait a bit, old chap, and I’ll give ye a sling for that wounded arm,” cried cruel Flask, pointing to the whale-line near him.

“Mind he don’t sling thee with it,” cried Starbuck. “Give way, or the German will have him.”

With one intent all the combined rival boats were pointed for this one fish, because not only was he the largest, and therefore the most valuable whale, but he was nearest to them, and the other whales were going with such great velocity, moreover, as almost to defy pursuit for the time. At this juncture the Pequod’s keels had shot by the three German boats last lowered; but from the great start he had had, Derick’s boat still led the chase, though every moment neared by his foreign rivals. The only thing they feared, was, that from being already so nigh to his mark, he would be enabled to dart his iron before they could completely overtake and pass him. As for Derick, he seemed quite confident that this would be the case, and occasionally with a deriding gesture shook his lamp-feeder at the other boats.

“The ungracious and ungrateful dog!” cried Starbuck; “he mocks and dares me with the very poor-box I filled for him not five minutes ago!”—then in his old intense whisper—“Give way, greyhounds! Dog to it!”

“I tell ye what it is, men”—cried Stubb to his crew—“it’s against my religion to get mad; but I’d like to eat that villainous Yarman—Pull—won’t ye? Are ye going to let that rascal beat ye? Do ye love brandy? A hogshead of brandy, then, to the best man. Come, why don’t some of ye burst a blood-vessel? Who’s that been dropping an anchor overboard—we don’t budge an inch—we’re becalmed. Halloo, here’s grass growing in the boat’s bottom—and by the Lord, the mast there’s budding. This won’t do, boys. Look at that Yarman! The short and long of it is, men, will ye spit fire or not?”

“Oh! see the suds he makes!” cried Flask, dancing up and down—“What a hump—Oh, do pile on the beef—lays like a log! Oh! my lads, do spring—slap-jacks and quahogs for supper, you know, my lads—baked clams and muffins—oh, do, do, spring,—he’s a hundred barreller—don’t lose him now—don’t oh, don’t!—see that Yarman—Oh, won’t ye pull for your duff, my lads—such a sog! such a sogger! Don’t ye love sperm? There goes three thousand dollars, men!—a bank!—a whole bank! The bank of England!—Oh, do, do, do!—What’s that Yarman about now?”

At this moment Derick was in the act of pitching his lamp-feeder at the advancing boats, and also his oil-can; perhaps with the double view of retarding his rivals’ way, and at the same time economically accelerating his own by the momentary impetus of the backward toss.

“The unmannerly Dutch dogger!” cried Stubb. “Pull now, men, like fifty thousand line-of-battle-ship loads of red-haired devils. What d’ye say, Tashtego; are you the man to snap your spine in two-and-twenty pieces for the honor of old Gayhead? What d’ye say?”

“I say, pull like god-dam,”—cried the Indian.

Fiercely, but evenly incited by the taunts of the German, the Pequod’s three boats now began ranging almost abreast; and, so disposed, momentarily neared him. In that fine, loose, chivalrous attitude of the headsman when drawing near to his prey, the three mates stood up proudly, occasionally backing the after oarsman with an exhilarating cry of, “There she slides, now! Hurrah for the white-ash breeze! Down with the Yarman! Sail over him!”

But so decided an original start had Derick had, that spite of all their gallantry, he would have proved the victor in this race, had not a righteous judgment descended upon him in a crab which caught the blade of his midship oarsman. While this clumsy lubber was striving to free his white-ash, and while, in consequence, Derick’s boat was nigh to capsizing, and he thundering away at his men in a mighty rage;—that was a good time for Starbuck, Stubb, and Flask. With a shout, they took a mortal start forwards, and slantingly ranged up on the German’s quarter. An instant more, and all four boats were diagonically in the whale’s immediate wake, while stretching from them, on both sides, was the foaming swell that he made.

It was a terrific, most pitiable, and maddening sight. The whale was now going head out, and sending his spout before him in a continual tormented jet; while his one poor fin beat his side in an agony of fright. Now to this hand, now to that, he yawed in his faltering flight, and still at every billow that he broke, he spasmodically sank in the sea, or sideways rolled towards the sky his one beating fin. So have I seen a bird with clipped wing making affrighted broken circles in the air, vainly striving to escape the piratical hawks. But the bird has a voice, and with plaintive cries will make known her fear; but the fear of this vast dumb brute of the sea, was chained up and enchanted in him; he had no voice, save that choking respiration through his spiracle, and this made the sight of him unspeakably pitiable; while still, in his amazing bulk, portcullis jaw, and omnipotent tail, there was enough to appal the stoutest man who so pitied.

Seeing now that but a very few moments more would give the Pequod’s boats the advantage, and rather than be thus foiled of his game, Derick chose to hazard what to him must have seemed a most unusually long dart, ere the last chance would for ever escape.

But no sooner did his harpooneer stand up for the stroke, than all three tigers—Queequeg, Tashtego, Daggoo—instinctively sprang to their feet, and standing in a diagonal row, simultaneously pointed their barbs; and darted over the head of the German harpooneer, their three Nantucket irons entered the whale. Blinding vapors of foam and white-fire! The three boats, in the first fury of the whale’s headlong rush, bumped the German’s aside with such force, that both Derick and his baffled harpooneer were spilled out, and sailed over by the three flying keels.

“Don’t be afraid, my butter-boxes,” cried Stubb, casting a passing glance upon them as he shot by; “ye’ll be picked up presently—all right—I saw some sharks astern—St. Bernard’s dogs, you know—relieve distressed travellers. Hurrah! this is the way to sail now. Every keel a sunbeam! Hurrah!—Here we go like three tin kettles at the tail of a mad cougar! This puts me in mind of fastening to an elephant in a tilbury on a plain—makes the wheel-spokes fly, boys, when you fasten to him that way; and there’s danger of being pitched out too, when you strike a hill. Hurrah! this is the way a fellow feels when he’s going to Davy Jones—all a rush down an endless inclined plane! Hurrah! this whale carries the everlasting mail!”

But the monster’s run was a brief one. Giving a sudden gasp, he tumultuously sounded. With a grating rush, the three lines flew round the loggerheads with such a force as to gouge deep grooves in them; while so fearful were the harpooneers that this rapid sounding would soon exhaust the lines, that using all their dexterous might, they caught repeated smoking turns with the rope to hold on; till at last—owing to the perpendicular strain from the lead-lined chocks of the boats, whence the three ropes went straight down into the blue—the gunwales of the bows were almost even with the water, while the three sterns tilted high in the air. And the whale soon ceasing to sound, for some time they remained in that attitude, fearful of expending more line, though the position was a little ticklish. But though boats have been taken down and lost in this way, yet it is this “holding on,” as it is called; this hooking up by the sharp barbs of his live flesh from the back; this it is that often torments the Leviathan into soon rising again to meet the sharp lance of his foes. Yet not to speak of the peril of the thing, it is to be doubted whether this course is always the best; for it is but reasonable to presume, that the longer the stricken whale stays under water, the more he is exhausted. Because, owing to the enormous surface of him—in a full grown sperm whale something less than 2000 square feet—the pressure of the water is immense. We all know what an astonishing atmospheric weight we ourselves stand up under; even here, above-ground, in the air; how vast, then, the burden of a whale, bearing on his back a column of two hundred fathoms of ocean! It must at least equal the weight of fifty atmospheres. One whaleman has estimated it at the weight of twenty line-of-battle ships, with all their guns, and stores, and men on board.

As the three boats lay there on that gently rolling sea, gazing down into its eternal blue noon; and as not a single groan or cry of any sort, nay, not so much as a ripple or a bubble came up from its depths; what landsman would have thought, that beneath all that silence and placidity, the utmost monster of the seas was writhing and wrenching in agony! Not eight inches of perpendicular rope were visible at the bows. Seems it credible that by three such thin threads the great Leviathan was suspended like the big weight to an eight day clock. Suspended? and to what? To three bits of board. Is this the creature of whom it was once so triumphantly said—“Canst thou fill his skin with barbed irons? or his head with fish-spears? The sword of him that layeth at him cannot hold, the spear, the dart, nor the habergeon: he esteemeth iron as straw; the arrow cannot make him flee; darts are counted as stubble; he laugheth at the shaking of a spear!” This the creature? this he? Oh! that unfulfilments should follow the prophets. For with the strength of a thousand thighs in his tail, Leviathan had run his head under the mountains of the sea, to hide him from the Pequod’s fish-spears!

In that sloping afternoon sunlight, the shadows that the three boats sent down beneath the surface, must have been long enough and broad enough to shade half Xerxes’ army. Who can tell how appalling to the wounded whale must have been such huge phantoms flitting over his head!

“Stand by, men; he stirs,” cried Starbuck, as the three lines suddenly vibrated in the water, distinctly conducting upwards to them, as by magnetic wires, the life and death throbs of the whale, so that every oarsman felt them in his seat. The next moment, relieved in great part from the downward strain at the bows, the boats gave a sudden bounce upwards, as a small icefield will, when a dense herd of white bears are scared from it into the sea.

“Haul in! Haul in!” cried Starbuck again; “he’s rising.”

The lines, of which, hardly an instant before, not one hand’s breadth could have been gained, were now in long quick coils flung back all dripping into the boats, and soon the whale broke water within two ship’s lengths of the hunters.

His motions plainly denoted his extreme exhaustion. In most land animals there are certain valves or flood-gates in many of their veins, whereby when wounded, the blood is in some degree at least instantly shut off in certain directions. Not so with the whale; one of whose peculiarities it is to have an entire non-valvular structure of the blood-vessels, so that when pierced even by so small a point as a harpoon, a deadly drain is at once begun upon his whole arterial system; and when this is heightened by the extraordinary pressure of water at a great distance below the surface, his life may be said to pour from him in incessant streams. Yet so vast is the quantity of blood in him, and so distant and numerous its interior fountains, that he will keep thus bleeding and bleeding for a considerable period; even as in a drought a river will flow, whose source is in the well-springs of far-off and undiscernible hills. Even now, when the boats pulled upon this whale, and perilously drew over his swaying flukes, and the lances were darted into him, they were followed by steady jets from the new made wound, which kept continually playing, while the natural spout-hole in his head was only at intervals, however rapid, sending its affrighted moisture into the air. From this last vent no blood yet came, because no vital part of him had thus far been struck. His life, as they significantly call it, was untouched.

As the boats now more closely surrounded him, the whole upper part of his form, with much of it that is ordinarily submerged, was plainly revealed. His eyes, or rather the places where his eyes had been, were beheld. As strange misgrown masses gather in the knot-holes of the noblest oaks when prostrate, so from the points which the whale’s eyes had once occupied, now protruded blind bulbs, horribly pitiable to see. But pity there was none. For all his old age, and his one arm, and his blind eyes, he must die the death and be murdered, in order to light the gay bridals and other merry-makings of men, and also to illuminate the solemn churches that preach unconditional inoffensiveness by all to all. Still rolling in his blood, at last he partially disclosed a strangely discoloured bunch or protuberance, the size of a bushel, low down on the flank.

“A nice spot,” cried Flask; “just let me prick him there once.”

“Avast!” cried Starbuck, “there’s no need of that!”

But humane Starbuck was too late. At the instant of the dart an ulcerous jet shot from this cruel wound, and goaded by it into more than sufferable anguish, the whale now spouting thick blood, with swift fury blindly darted at the craft, bespattering them and their glorying crews all over with showers of gore, capsizing Flask’s boat and marring the bows. It was his death stroke. For, by this time, so spent was he by loss of blood, that he helplessly rolled away from the wreck he had made; lay panting on his side, impotently flapped with his stumped fin, then over and over slowly revolved like a waning world; turned up the white secrets of his belly; lay like a log, and died. It was most piteous, that last expiring spout. As when by unseen hands the water is gradually drawn off from some mighty fountain, and with half-stifled melancholy gurglings the spray-column lowers and lowers to the ground—so the last long dying spout of the whale.

Soon, while the crews were awaiting the arrival of the ship, the body showed symptoms of sinking with all its treasures unrifled. Immediately, by Starbuck’s orders, lines were secured to it at different points, so that ere long every boat was a buoy; the sunken whale being suspended a few inches beneath them by the cords. By very heedful management, when the ship drew nigh, the whale was transferred to her side, and was strongly secured there by the stiffest fluke-chains, for it was plain that unless artificially upheld, the body would at once sink to the bottom.

It so chanced that almost upon first cutting into him with the spade, the entire length of a corroded harpoon was found imbedded in his flesh, on the lower part of the bunch before described. But as the stumps of harpoons are frequently found in the dead bodies of captured whales, with the flesh perfectly healed around them, and no prominence of any kind to denote their place; therefore, there must needs have been some other unknown reason in the present case fully to account for the ulceration alluded to. But still more curious was the fact of a lance-head of stone being found in him, not far from the buried iron, the flesh perfectly firm about it. Who had darted that stone lance? And when? It might have been darted by some Nor’ West Indian long before America was discovered.

What other marvels might have been rummaged out of this monstrous cabinet there is no telling. But a sudden stop was put to further discoveries, by the ship’s being unprecedentedly dragged over sideways to the sea, owing to the body’s immensely increasing tendency to sink. However, Starbuck, who had the ordering of affairs, hung on to it to the last; hung on to it so resolutely, indeed, that when at length the ship would have been capsized, if still persisting in locking arms with the body; then, when the command was given to break clear from it, such was the immovable strain upon the timber-heads to which the fluke-chains and cables were fastened, that it was impossible to cast them off. Meantime everything in the Pequod was aslant. To cross to the other side of the deck was like walking up the steep gabled roof of a house. The ship groaned and gasped. Many of the ivory inlayings of her bulwarks and cabins were started from their places, by the unnatural dislocation. In vain handspikes and crows were brought to bear upon the immovable fluke-chains, to pry them adrift from the timberheads; and so low had the whale now settled that the submerged ends could not be at all approached, while every moment whole tons of ponderosity seemed added to the sinking bulk, and the ship seemed on the point of going over.

“Hold on, hold on, won’t ye?” cried Stubb to the body, “don’t be in such a devil of a hurry to sink! By thunder, men, we must do something or go for it. No use prying there; avast, I say with your handspikes, and run one of ye for a prayer book and a pen-knife, and cut the big chains.”

“Knife? Aye, aye,” cried Queequeg, and seizing the carpenter’s heavy hatchet, he leaned out of a porthole, and steel to iron, began slashing at the largest fluke-chains. But a few strokes, full of sparks, were given, when the exceeding strain effected the rest. With a terrific snap, every fastening went adrift; the ship righted, the carcase sank.

Now, this occasional inevitable sinking of the recently killed Sperm Whale is a very curious thing; nor has any fisherman yet adequately accounted for it. Usually the dead Sperm Whale floats with great buoyancy, with its side or belly considerably elevated above the surface. If the only whales that thus sank were old, meagre, and broken-hearted creatures, their pads of lard diminished and all their bones heavy and rheumatic; then you might with some reason assert that this sinking is caused by an uncommon specific gravity in the fish so sinking, consequent upon this absence of buoyant matter in him. But it is not so. For young whales, in the highest health, and swelling with noble aspirations, prematurely cut off in the warm flush and May of life, with all their panting lard about them; even these brawny, buoyant heroes do sometimes sink.

Be it said, however, that the Sperm Whale is far less liable to this accident than any other species. Where one of that sort go down, twenty Right Whales do. This difference in the species is no doubt imputable in no small degree to the greater quantity of bone in the Right Whale; his Venetian blinds alone sometimes weighing more than a ton; from this incumbrance the Sperm Whale is wholly free. But there are instances where, after the lapse of many hours or several days, the sunken whale again rises, more buoyant than in life. But the reason of this is obvious. Gases are generated in him; he swells to a prodigious magnitude; becomes a sort of animal balloon. A line-of-battle ship could hardly keep him under then. In the Shore Whaling, on soundings, among the Bays of New Zealand, when a Right Whale gives token of sinking, they fasten buoys to him, with plenty of rope; so that when the body has gone down, they know where to look for it when it shall have ascended again.

It was not long after the sinking of the body that a cry was heard from the Pequod’s mast-heads, announcing that the Jungfrau was again lowering her boats; though the only spout in sight was that of a Fin-Back, belonging to the species of uncapturable whales, because of its incredible power of swimming. Nevertheless, the Fin-Back’s spout is so similar to the Sperm Whale’s, that by unskilful fishermen it is often mistaken for it. And consequently Derick and all his host were now in valiant chase of this unnearable brute. The Virgin crowding all sail, made after her four young keels, and thus they all disappeared far to leeward, still in bold, hopeful chase.

Oh! many are the Fin-Backs, and many are the Dericks, my friend.






CHAPTER 82. The Honor and Glory of Whaling.
There are some enterprises in which a careful disorderliness is the true method.

The more I dive into this matter of whaling, and push my researches up to the very spring-head of it so much the more am I impressed with its great honorableness and antiquity; and especially when I find so many great demi-gods and heroes, prophets of all sorts, who one way or other have shed distinction upon it, I am transported with the reflection that I myself belong, though but subordinately, to so emblazoned a fraternity.

The gallant Perseus, a son of Jupiter, was the first whaleman; and to the eternal honor of our calling be it said, that the first whale attacked by our brotherhood was not killed with any sordid intent. Those were the knightly days of our profession, when we only bore arms to succor the distressed, and not to fill men’s lamp-feeders. Every one knows the fine story of Perseus and Andromeda; how the lovely Andromeda, the daughter of a king, was tied to a rock on the sea-coast, and as Leviathan was in the very act of carrying her off, Perseus, the prince of whalemen, intrepidly advancing, harpooned the monster, and delivered and married the maid. It was an admirable artistic exploit, rarely achieved by the best harpooneers of the present day; inasmuch as this Leviathan was slain at the very first dart. And let no man doubt this Arkite story; for in the ancient Joppa, now Jaffa, on the Syrian coast, in one of the Pagan temples, there stood for many ages the vast skeleton of a whale, which the city’s legends and all the inhabitants asserted to be the identical bones of the monster that Perseus slew. When the Romans took Joppa, the same skeleton was carried to Italy in triumph. What seems most singular and suggestively important in this story, is this: it was from Joppa that Jonah set sail.

Akin to the adventure of Perseus and Andromeda—indeed, by some supposed to be indirectly derived from it—is that famous story of St. George and the Dragon; which dragon I maintain to have been a whale; for in many old chronicles whales and dragons are strangely jumbled together, and often stand for each other. “Thou art as a lion of the waters, and as a dragon of the sea,” saith Ezekiel; hereby, plainly meaning a whale; in truth, some versions of the Bible use that word itself. Besides, it would much subtract from the glory of the exploit had St. George but encountered a crawling reptile of the land, instead of doing battle with the great monster of the deep. Any man may kill a snake, but only a Perseus, a St. George, a Coffin, have the heart in them to march boldly up to a whale.

Let not the modern paintings of this scene mislead us; for though the creature encountered by that valiant whaleman of old is vaguely represented of a griffin-like shape, and though the battle is depicted on land and the saint on horseback, yet considering the great ignorance of those times, when the true form of the whale was unknown to artists; and considering that as in Perseus’ case, St. George’s whale might have crawled up out of the sea on the beach; and considering that the animal ridden by St. George might have been only a large seal, or sea-horse; bearing all this in mind, it will not appear altogether incompatible with the sacred legend and the ancientest draughts of the scene, to hold this so-called dragon no other than the great Leviathan himself. In fact, placed before the strict and piercing truth, this whole story will fare like that fish, flesh, and fowl idol of the Philistines, Dagon by name; who being planted before the ark of Israel, his horse’s head and both the palms of his hands fell off from him, and only the stump or fishy part of him remained. Thus, then, one of our own noble stamp, even a whaleman, is the tutelary guardian of England; and by good rights, we harpooneers of Nantucket should be enrolled in the most noble order of St. George. And therefore, let not the knights of that honorable company (none of whom, I venture to say, have ever had to do with a whale like their great patron), let them never eye a Nantucketer with disdain, since even in our woollen frocks and tarred trowsers we are much better entitled to St. George’s decoration than they.

Whether to admit Hercules among us or not, concerning this I long remained dubious: for though according to the Greek mythologies, that antique Crockett and Kit Carson—that brawny doer of rejoicing good deeds, was swallowed down and thrown up by a whale; still, whether that strictly makes a whaleman of him, that might be mooted. It nowhere appears that he ever actually harpooned his fish, unless, indeed, from the inside. Nevertheless, he may be deemed a sort of involuntary whaleman; at any rate the whale caught him, if he did not the whale. I claim him for one of our clan.

But, by the best contradictory authorities, this Grecian story of Hercules and the whale is considered to be derived from the still more ancient Hebrew story of Jonah and the whale; and vice versâ; certainly they are very similar. If I claim the demi-god then, why not the prophet?

Nor do heroes, saints, demigods, and prophets alone comprise the whole roll of our order. Our grand master is still to be named; for like royal kings of old times, we find the head waters of our fraternity in nothing short of the great gods themselves. That wondrous oriental story is now to be rehearsed from the Shaster, which gives us the dread Vishnoo, one of the three persons in the godhead of the Hindoos; gives us this divine Vishnoo himself for our Lord;—Vishnoo, who, by the first of his ten earthly incarnations, has for ever set apart and sanctified the whale. When Brahma, or the God of Gods, saith the Shaster, resolved to recreate the world after one of its periodical dissolutions, he gave birth to Vishnoo, to preside over the work; but the Vedas, or mystical books, whose perusal would seem to have been indispensable to Vishnoo before beginning the creation, and which therefore must have contained something in the shape of practical hints to young architects, these Vedas were lying at the bottom of the waters; so Vishnoo became incarnate in a whale, and sounding down in him to the uttermost depths, rescued the sacred volumes. Was not this Vishnoo a whaleman, then? even as a man who rides a horse is called a horseman?

Perseus, St. George, Hercules, Jonah, and Vishnoo! there’s a member-roll for you! What club but the whaleman’s can head off like that?






CHAPTER 83. Jonah Historically Regarded.
Reference was made to the historical story of Jonah and the whale in the preceding chapter. Now some Nantucketers rather distrust this historical story of Jonah and the whale. But then there were some sceptical Greeks and Romans, who, standing out from the orthodox pagans of their times, equally doubted the story of Hercules and the whale, and Arion and the dolphin; and yet their doubting those traditions did not make those traditions one whit the less facts, for all that.

One old Sag-Harbor whaleman’s chief reason for questioning the Hebrew story was this:—He had one of those quaint old-fashioned Bibles, embellished with curious, unscientific plates; one of which represented Jonah’s whale with two spouts in his head—a peculiarity only true with respect to a species of the Leviathan (the Right Whale, and the varieties of that order), concerning which the fishermen have this saying, “A penny roll would choke him”; his swallow is so very small. But, to this, Bishop Jebb’s anticipative answer is ready. It is not necessary, hints the Bishop, that we consider Jonah as tombed in the whale’s belly, but as temporarily lodged in some part of his mouth. And this seems reasonable enough in the good Bishop. For truly, the Right Whale’s mouth would accommodate a couple of whist-tables, and comfortably seat all the players. Possibly, too, Jonah might have ensconced himself in a hollow tooth; but, on second thoughts, the Right Whale is toothless.

Another reason which Sag-Harbor (he went by that name) urged for his want of faith in this matter of the prophet, was something obscurely in reference to his incarcerated body and the whale’s gastric juices. But this objection likewise falls to the ground, because a German exegetist supposes that Jonah must have taken refuge in the floating body of a dead whale—even as the French soldiers in the Russian campaign turned their dead horses into tents, and crawled into them. Besides, it has been divined by other continental commentators, that when Jonah was thrown overboard from the Joppa ship, he straightway effected his escape to another vessel near by, some vessel with a whale for a figure-head; and, I would add, possibly called “The Whale,” as some craft are nowadays christened the “Shark,” the “Gull,” the “Eagle.” Nor have there been wanting learned exegetists who have opined that the whale mentioned in the book of Jonah merely meant a life-preserver—an inflated bag of wind—which the endangered prophet swam to, and so was saved from a watery doom. Poor Sag-Harbor, therefore, seems worsted all round. But he had still another reason for his want of faith. It was this, if I remember right: Jonah was swallowed by the whale in the Mediterranean Sea, and after three days he was vomited up somewhere within three days’ journey of Nineveh, a city on the Tigris, very much more than three days’ journey across from the nearest point of the Mediterranean coast. How is that?

But was there no other way for the whale to land the prophet within that short distance of Nineveh? Yes. He might have carried him round by the way of the Cape of Good Hope. But not to speak of the passage through the whole length of the Mediterranean, and another passage up the Persian Gulf and Red Sea, such a supposition would involve the complete circumnavigation of all Africa in three days, not to speak of the Tigris waters, near the site of Nineveh, being too shallow for any whale to swim in. Besides, this idea of Jonah’s weathering the Cape of Good Hope at so early a day would wrest the honor of the discovery of that great headland from Bartholomew Diaz, its reputed discoverer, and so make modern history a liar.

But all these foolish arguments of old Sag-Harbor only evinced his foolish pride of reason—a thing still more reprehensible in him, seeing that he had but little learning except what he had picked up from the sun and the sea. I say it only shows his foolish, impious pride, and abominable, devilish rebellion against the reverend clergy. For by a Portuguese Catholic priest, this very idea of Jonah’s going to Nineveh via the Cape of Good Hope was advanced as a signal magnification of the general miracle. And so it was. Besides, to this day, the highly enlightened Turks devoutly believe in the historical story of Jonah. And some three centuries ago, an English traveller in old Harris’s Voyages, speaks of a Turkish Mosque built in honor of Jonah, in which Mosque was a miraculous lamp that burnt without any oil.






CHAPTER 84. Pitchpoling.
To make them run easily and swiftly, the axles of carriages are anointed; and for much the same purpose, some whalers perform an analogous operation upon their boat; they grease the bottom. Nor is it to be doubted that as such a procedure can do no harm, it may possibly be of no contemptible advantage; considering that oil and water are hostile; that oil is a sliding thing, and that the object in view is to make the boat slide bravely. Queequeg believed strongly in anointing his boat, and one morning not long after the German ship Jungfrau disappeared, took more than customary pains in that occupation; crawling under its bottom, where it hung over the side, and rubbing in the unctuousness as though diligently seeking to insure a crop of hair from the craft’s bald keel. He seemed to be working in obedience to some particular presentiment. Nor did it remain unwarranted by the event.

Towards noon whales were raised; but so soon as the ship sailed down to them, they turned and fled with swift precipitancy; a disordered flight, as of Cleopatra’s barges from Actium.

Nevertheless, the boats pursued, and Stubb’s was foremost. By great exertion, Tashtego at last succeeded in planting one iron; but the stricken whale, without at all sounding, still continued his horizontal flight, with added fleetness. Such unintermitted strainings upon the planted iron must sooner or later inevitably extract it. It became imperative to lance the flying whale, or be content to lose him. But to haul the boat up to his flank was impossible, he swam so fast and furious. What then remained?

Of all the wondrous devices and dexterities, the sleights of hand and countless subtleties, to which the veteran whaleman is so often forced, none exceed that fine manœuvre with the lance called pitchpoling. Small sword, or broad sword, in all its exercises boasts nothing like it. It is only indispensable with an inveterate running whale; its grand fact and feature is the wonderful distance to which the long lance is accurately darted from a violently rocking, jerking boat, under extreme headway. Steel and wood included, the entire spear is some ten or twelve feet in length; the staff is much slighter than that of the harpoon, and also of a lighter material—pine. It is furnished with a small rope called a warp, of considerable length, by which it can be hauled back to the hand after darting.

But before going further, it is important to mention here, that though the harpoon may be pitchpoled in the same way with the lance, yet it is seldom done; and when done, is still less frequently successful, on account of the greater weight and inferior length of the harpoon as compared with the lance, which in effect become serious drawbacks. As a general thing, therefore, you must first get fast to a whale, before any pitchpoling comes into play.

Look now at Stubb; a man who from his humorous, deliberate coolness and equanimity in the direst emergencies, was specially qualified to excel in pitchpoling. Look at him; he stands upright in the tossed bow of the flying boat; wrapt in fleecy foam, the towing whale is forty feet ahead. Handling the long lance lightly, glancing twice or thrice along its length to see if it be exactly straight, Stubb whistlingly gathers up the coil of the warp in one hand, so as to secure its free end in his grasp, leaving the rest unobstructed. Then holding the lance full before his waistband’s middle, he levels it at the whale; when, covering him with it, he steadily depresses the butt-end in his hand, thereby elevating the point till the weapon stands fairly balanced upon his palm, fifteen feet in the air. He minds you somewhat of a juggler, balancing a long staff on his chin. Next moment with a rapid, nameless impulse, in a superb lofty arch the bright steel spans the foaming distance, and quivers in the life spot of the whale. Instead of sparkling water, he now spouts red blood.

“That drove the spigot out of him!” cried Stubb. “’Tis July’s immortal Fourth; all fountains must run wine today! Would now, it were old Orleans whiskey, or old Ohio, or unspeakable old Monongahela! Then, Tashtego, lad, I’d have ye hold a canakin to the jet, and we’d drink round it! Yea, verily, hearts alive, we’d brew choice punch in the spread of his spout-hole there, and from that live punch-bowl quaff the living stuff.”

Again and again to such gamesome talk, the dexterous dart is repeated, the spear returning to its master like a greyhound held in skilful leash. The agonized whale goes into his flurry; the tow-line is slackened, and the pitchpoler dropping astern, folds his hands, and mutely watches the monster die.






CHAPTER 85. The Fountain.
That for six thousand years—and no one knows how many millions of ages before—the great whales should have been spouting all over the sea, and sprinkling and mistifying the gardens of the deep, as with so many sprinkling or mistifying pots; and that for some centuries back, thousands of hunters should have been close by the fountain of the whale, watching these sprinklings and spoutings—that all this should be, and yet, that down to this blessed minute (fifteen and a quarter minutes past one o’clock P.M. of this sixteenth day of December, A.D. 1851), it should still remain a problem, whether these spoutings are, after all, really water, or nothing but vapor—this is surely a noteworthy thing.

Let us, then, look at this matter, along with some interesting items contingent. Every one knows that by the peculiar cunning of their gills, the finny tribes in general breathe the air which at all times is combined with the element in which they swim; hence, a herring or a cod might live a century, and never once raise its head above the surface. But owing to his marked internal structure which gives him regular lungs, like a human being’s, the whale can only live by inhaling the disengaged air in the open atmosphere. Wherefore the necessity for his periodical visits to the upper world. But he cannot in any degree breathe through his mouth, for, in his ordinary attitude, the Sperm Whale’s mouth is buried at least eight feet beneath the surface; and what is still more, his windpipe has no connexion with his mouth. No, he breathes through his spiracle alone; and this is on the top of his head.

If I say, that in any creature breathing is only a function indispensable to vitality, inasmuch as it withdraws from the air a certain element, which being subsequently brought into contact with the blood imparts to the blood its vivifying principle, I do not think I shall err; though I may possibly use some superfluous scientific words. Assume it, and it follows that if all the blood in a man could be aerated with one breath, he might then seal up his nostrils and not fetch another for a considerable time. That is to say, he would then live without breathing. Anomalous as it may seem, this is precisely the case with the whale, who systematically lives, by intervals, his full hour and more (when at the bottom) without drawing a single breath, or so much as in any way inhaling a particle of air; for, remember, he has no gills. How is this? Between his ribs and on each side of his spine he is supplied with a remarkable involved Cretan labyrinth of vermicelli-like vessels, which vessels, when he quits the surface, are completely distended with oxygenated blood. So that for an hour or more, a thousand fathoms in the sea, he carries a surplus stock of vitality in him, just as the camel crossing the waterless desert carries a surplus supply of drink for future use in its four supplementary stomachs. The anatomical fact of this labyrinth is indisputable; and that the supposition founded upon it is reasonable and true, seems the more cogent to me, when I consider the otherwise inexplicable obstinacy of that leviathan in having his spoutings out, as the fishermen phrase it. This is what I mean. If unmolested, upon rising to the surface, the Sperm Whale will continue there for a period of time exactly uniform with all his other unmolested risings. Say he stays eleven minutes, and jets seventy times, that is, respires seventy breaths; then whenever he rises again, he will be sure to have his seventy breaths over again, to a minute. Now, if after he fetches a few breaths you alarm him, so that he sounds, he will be always dodging up again to make good his regular allowance of air. And not till those seventy breaths are told, will he finally go down to stay out his full term below. Remark, however, that in different individuals these rates are different; but in any one they are alike. Now, why should the whale thus insist upon having his spoutings out, unless it be to replenish his reservoir of air, ere descending for good? How obvious is it, too, that this necessity for the whale’s rising exposes him to all the fatal hazards of the chase. For not by hook or by net could this vast leviathan be caught, when sailing a thousand fathoms beneath the sunlight. Not so much thy skill, then, O hunter, as the great necessities that strike the victory to thee!

In man, breathing is incessantly going on—one breath only serving for two or three pulsations; so that whatever other business he has to attend to, waking or sleeping, breathe he must, or die he will. But the Sperm Whale only breathes about one seventh or Sunday of his time.

It has been said that the whale only breathes through his spout-hole; if it could truthfully be added that his spouts are mixed with water, then I opine we should be furnished with the reason why his sense of smell seems obliterated in him; for the only thing about him that at all answers to his nose is that identical spout-hole; and being so clogged with two elements, it could not be expected to have the power of smelling. But owing to the mystery of the spout—whether it be water or whether it be vapor—no absolute certainty can as yet be arrived at on this head. Sure it is, nevertheless, that the Sperm Whale has no proper olfactories. But what does he want of them? No roses, no violets, no Cologne-water in the sea.

Furthermore, as his windpipe solely opens into the tube of his spouting canal, and as that long canal—like the grand Erie Canal—is furnished with a sort of locks (that open and shut) for the downward retention of air or the upward exclusion of water, therefore the whale has no voice; unless you insult him by saying, that when he so strangely rumbles, he talks through his nose. But then again, what has the whale to say? Seldom have I known any profound being that had anything to say to this world, unless forced to stammer out something by way of getting a living. Oh! happy that the world is such an excellent listener!

Now, the spouting canal of the Sperm Whale, chiefly intended as it is for the conveyance of air, and for several feet laid along, horizontally, just beneath the upper surface of his head, and a little to one side; this curious canal is very much like a gas-pipe laid down in a city on one side of a street. But the question returns whether this gas-pipe is also a water-pipe; in other words, whether the spout of the Sperm Whale is the mere vapor of the exhaled breath, or whether that exhaled breath is mixed with water taken in at the mouth, and discharged through the spiracle. It is certain that the mouth indirectly communicates with the spouting canal; but it cannot be proved that this is for the purpose of discharging water through the spiracle. Because the greatest necessity for so doing would seem to be, when in feeding he accidentally takes in water. But the Sperm Whale’s food is far beneath the surface, and there he cannot spout even if he would. Besides, if you regard him very closely, and time him with your watch, you will find that when unmolested, there is an undeviating rhyme between the periods of his jets and the ordinary periods of respiration.

But why pester one with all this reasoning on the subject? Speak out! You have seen him spout; then declare what the spout is; can you not tell water from air? My dear sir, in this world it is not so easy to settle these plain things. I have ever found your plain things the knottiest of all. And as for this whale spout, you might almost stand in it, and yet be undecided as to what it is precisely.

The central body of it is hidden in the snowy sparkling mist enveloping it; and how can you certainly tell whether any water falls from it, when, always, when you are close enough to a whale to get a close view of his spout, he is in a prodigious commotion, the water cascading all around him. And if at such times you should think that you really perceived drops of moisture in the spout, how do you know that they are not merely condensed from its vapor; or how do you know that they are not those identical drops superficially lodged in the spout-hole fissure, which is countersunk into the summit of the whale’s head? For even when tranquilly swimming through the mid-day sea in a calm, with his elevated hump sun-dried as a dromedary’s in the desert; even then, the whale always carries a small basin of water on his head, as under a blazing sun you will sometimes see a cavity in a rock filled up with rain.

Nor is it at all prudent for the hunter to be over curious touching the precise nature of the whale spout. It will not do for him to be peering into it, and putting his face in it. You cannot go with your pitcher to this fountain and fill it, and bring it away. For even when coming into slight contact with the outer, vapory shreds of the jet, which will often happen, your skin will feverishly smart, from the acridness of the thing so touching it. And I know one, who coming into still closer contact with the spout, whether with some scientific object in view, or otherwise, I cannot say, the skin peeled off from his cheek and arm. Wherefore, among whalemen, the spout is deemed poisonous; they try to evade it. Another thing; I have heard it said, and I do not much doubt it, that if the jet is fairly spouted into your eyes, it will blind you. The wisest thing the investigator can do then, it seems to me, is to let this deadly spout alone.

Still, we can hypothesize, even if we cannot prove and establish. My hypothesis is this: that the spout is nothing but mist. And besides other reasons, to this conclusion I am impelled, by considerations touching the great inherent dignity and sublimity of the Sperm Whale; I account him no common, shallow being, inasmuch as it is an undisputed fact that he is never found on soundings, or near shores; all other whales sometimes are. He is both ponderous and profound. And I am convinced that from the heads of all ponderous profound beings, such as Plato, Pyrrho, the Devil, Jupiter, Dante, and so on, there always goes up a certain semi-visible steam, while in the act of thinking deep thoughts. While composing a little treatise on Eternity, I had the curiosity to place a mirror before me; and ere long saw reflected there, a curious involved worming and undulation in the atmosphere over my head. The invariable moisture of my hair, while plunged in deep thought, after six cups of hot tea in my thin shingled attic, of an August noon; this seems an additional argument for the above supposition.

And how nobly it raises our conceit of the mighty, misty monster, to behold him solemnly sailing through a calm tropical sea; his vast, mild head overhung by a canopy of vapor, engendered by his incommunicable contemplations, and that vapor—as you will sometimes see it—glorified by a rainbow, as if Heaven itself had put its seal upon his thoughts. For, d’ye see, rainbows do not visit the clear air; they only irradiate vapor. And so, through all the thick mists of the dim doubts in my mind, divine intuitions now and then shoot, enkindling my fog with a heavenly ray. And for this I thank God; for all have doubts; many deny; but doubts or denials, few along with them, have intuitions. Doubts of all things earthly, and intuitions of some things heavenly; this combination makes neither believer nor infidel, but makes a man who regards them both with equal eye.






CHAPTER 86. The Tail.
Other poets have warbled the praises of the soft eye of the antelope, and the lovely plumage of the bird that never alights; less celestial, I celebrate a tail.

Reckoning the largest sized Sperm Whale’s tail to begin at that point of the trunk where it tapers to about the girth of a man, it comprises upon its upper surface alone, an area of at least fifty square feet. The compact round body of its root expands into two broad, firm, flat palms or flukes, gradually shoaling away to less than an inch in thickness. At the crotch or junction, these flukes slightly overlap, then sideways recede from each other like wings, leaving a wide vacancy between. In no living thing are the lines of beauty more exquisitely defined than in the crescentic borders of these flukes. At its utmost expansion in the full grown whale, the tail will considerably exceed twenty feet across.

The entire member seems a dense webbed bed of welded sinews; but cut into it, and you find that three distinct strata compose it:—upper, middle, and lower. The fibres in the upper and lower layers, are long and horizontal; those of the middle one, very short, and running crosswise between the outside layers. This triune structure, as much as anything else, imparts power to the tail. To the student of old Roman walls, the middle layer will furnish a curious parallel to the thin course of tiles always alternating with the stone in those wonderful relics of the antique, and which undoubtedly contribute so much to the great strength of the masonry.

But as if this vast local power in the tendinous tail were not enough, the whole bulk of the leviathan is knit over with a warp and woof of muscular fibres and filaments, which passing on either side the loins and running down into the flukes, insensibly blend with them, and largely contribute to their might; so that in the tail the confluent measureless force of the whole whale seems concentrated to a point. Could annihilation occur to matter, this were the thing to do it.

Nor does this—its amazing strength, at all tend to cripple the graceful flexion of its motions; where infantileness of ease undulates through a Titanism of power. On the contrary, those motions derive their most appalling beauty from it. Real strength never impairs beauty or harmony, but it often bestows it; and in everything imposingly beautiful, strength has much to do with the magic. Take away the tied tendons that all over seem bursting from the marble in the carved Hercules, and its charm would be gone. As devout Eckerman lifted the linen sheet from the naked corpse of Goethe, he was overwhelmed with the massive chest of the man, that seemed as a Roman triumphal arch. When Angelo paints even God the Father in human form, mark what robustness is there. And whatever they may reveal of the divine love in the Son, the soft, curled, hermaphroditical Italian pictures, in which his idea has been most successfully embodied; these pictures, so destitute as they are of all brawniness, hint nothing of any power, but the mere negative, feminine one of submission and endurance, which on all hands it is conceded, form the peculiar practical virtues of his teachings.

Such is the subtle elasticity of the organ I treat of, that whether wielded in sport, or in earnest, or in anger, whatever be the mood it be in, its flexions are invariably marked by exceeding grace. Therein no fairy’s arm can transcend it.

Five great motions are peculiar to it. First, when used as a fin for progression; Second, when used as a mace in battle; Third, in sweeping; Fourth, in lobtailing; Fifth, in peaking flukes.

First: Being horizontal in its position, the Leviathan’s tail acts in a different manner from the tails of all other sea creatures. It never wriggles. In man or fish, wriggling is a sign of inferiority. To the whale, his tail is the sole means of propulsion. Scroll-wise coiled forwards beneath the body, and then rapidly sprung backwards, it is this which gives that singular darting, leaping motion to the monster when furiously swimming. His side-fins only serve to steer by.

Second: It is a little significant, that while one sperm whale only fights another sperm whale with his head and jaw, nevertheless, in his conflicts with man, he chiefly and contemptuously uses his tail. In striking at a boat, he swiftly curves away his flukes from it, and the blow is only inflicted by the recoil. If it be made in the unobstructed air, especially if it descend to its mark, the stroke is then simply irresistible. No ribs of man or boat can withstand it. Your only salvation lies in eluding it; but if it comes sideways through the opposing water, then partly owing to the light buoyancy of the whale-boat, and the elasticity of its materials, a cracked rib or a dashed plank or two, a sort of stitch in the side, is generally the most serious result. These submerged side blows are so often received in the fishery, that they are accounted mere child’s play. Some one strips off a frock, and the hole is stopped.

Third: I cannot demonstrate it, but it seems to me, that in the whale the sense of touch is concentrated in the tail; for in this respect there is a delicacy in it only equalled by the daintiness of the elephant’s trunk. This delicacy is chiefly evinced in the action of sweeping, when in maidenly gentleness the whale with a certain soft slowness moves his immense flukes from side to side upon the surface of the sea; and if he feel but a sailor’s whisker, woe to that sailor, whiskers and all. What tenderness there is in that preliminary touch! Had this tail any prehensile power, I should straightway bethink me of Darmonodes’ elephant that so frequented the flower-market, and with low salutations presented nosegays to damsels, and then caressed their zones. On more accounts than one, a pity it is that the whale does not possess this prehensile virtue in his tail; for I have heard of yet another elephant, that when wounded in the fight, curved round his trunk and extracted the dart.

Fourth: Stealing unawares upon the whale in the fancied security of the middle of solitary seas, you find him unbent from the vast corpulence of his dignity, and kitten-like, he plays on the ocean as if it were a hearth. But still you see his power in his play. The broad palms of his tail are flirted high into the air; then smiting the surface, the thunderous concussion resounds for miles. You would almost think a great gun had been discharged; and if you noticed the light wreath of vapor from the spiracle at his other extremity, you would think that that was the smoke from the touch-hole.

Fifth: As in the ordinary floating posture of the leviathan the flukes lie considerably below the level of his back, they are then completely out of sight beneath the surface; but when he is about to plunge into the deeps, his entire flukes with at least thirty feet of his body are tossed erect in the air, and so remain vibrating a moment, till they downwards shoot out of view. Excepting the sublime breach—somewhere else to be described—this peaking of the whale’s flukes is perhaps the grandest sight to be seen in all animated nature. Out of the bottomless profundities the gigantic tail seems spasmodically snatching at the highest heaven. So in dreams, have I seen majestic Satan thrusting forth his tormented colossal claw from the flame Baltic of Hell. But in gazing at such scenes, it is all in all what mood you are in; if in the Dantean, the devils will occur to you; if in that of Isaiah, the archangels. Standing at the mast-head of my ship during a sunrise that crimsoned sky and sea, I once saw a large herd of whales in the east, all heading towards the sun, and for a moment vibrating in concert with peaked flukes. As it seemed to me at the time, such a grand embodiment of adoration of the gods was never beheld, even in Persia, the home of the fire worshippers. As Ptolemy Philopater testified of the African elephant, I then testified of the whale, pronouncing him the most devout of all beings. For according to King Juba, the military elephants of antiquity often hailed the morning with their trunks uplifted in the profoundest silence.

The chance comparison in this chapter, between the whale and the elephant, so far as some aspects of the tail of the one and the trunk of the other are concerned, should not tend to place those two opposite organs on an equality, much less the creatures to which they respectively belong. For as the mightiest elephant is but a terrier to Leviathan, so, compared with Leviathan’s tail, his trunk is but the stalk of a lily. The most direful blow from the elephant’s trunk were as the playful tap of a fan, compared with the measureless crush and crash of the sperm whale’s ponderous flukes, which in repeated instances have one after the other hurled entire boats with all their oars and crews into the air, very much as an Indian juggler tosses his balls.*

*Though all comparison in the way of general bulk between the whale and the elephant is preposterous, inasmuch as in that particular the elephant stands in much the same respect to the whale that a dog does to the elephant; nevertheless, there are not wanting some points of curious similitude; among these is the spout. It is well known that the elephant will often draw up water or dust in his trunk, and then elevating it, jet it forth in a stream.

The more I consider this mighty tail, the more do I deplore my inability to express it. At times there are gestures in it, which, though they would well grace the hand of man, remain wholly inexplicable. In an extensive herd, so remarkable, occasionally, are these mystic gestures, that I have heard hunters who have declared them akin to Free-Mason signs and symbols; that the whale, indeed, by these methods intelligently conversed with the world. Nor are there wanting other motions of the whale in his general body, full of strangeness, and unaccountable to his most experienced assailant. Dissect him how I may, then, I but go skin deep; I know him not, and never will. But if I know not even the tail of this whale, how understand his head? much more, how comprehend his face, when face he has none? Thou shalt see my back parts, my tail, he seems to say, but my face shall not be seen. But I cannot completely make out his back parts; and hint what he will about his face, I say again he has no face.






CHAPTER 87. The Grand Armada.
The long and narrow peninsula of Malacca, extending south-eastward from the territories of Birmah, forms the most southerly point of all Asia. In a continuous line from that peninsula stretch the long islands of Sumatra, Java, Bally, and Timor; which, with many others, form a vast mole, or rampart, lengthwise connecting Asia with Australia, and dividing the long unbroken Indian ocean from the thickly studded oriental archipelagoes. This rampart is pierced by several sally-ports for the convenience of ships and whales; conspicuous among which are the straits of Sunda and Malacca. By the straits of Sunda, chiefly, vessels bound to China from the west, emerge into the China seas.

Those narrow straits of Sunda divide Sumatra from Java; and standing midway in that vast rampart of islands, buttressed by that bold green promontory, known to seamen as Java Head; they not a little correspond to the central gateway opening into some vast walled empire: and considering the inexhaustible wealth of spices, and silks, and jewels, and gold, and ivory, with which the thousand islands of that oriental sea are enriched, it seems a significant provision of nature, that such treasures, by the very formation of the land, should at least bear the appearance, however ineffectual, of being guarded from the all-grasping western world. The shores of the Straits of Sunda are unsupplied with those domineering fortresses which guard the entrances to the Mediterranean, the Baltic, and the Propontis. Unlike the Danes, these Orientals do not demand the obsequious homage of lowered top-sails from the endless procession of ships before the wind, which for centuries past, by night and by day, have passed between the islands of Sumatra and Java, freighted with the costliest cargoes of the east. But while they freely waive a ceremonial like this, they do by no means renounce their claim to more solid tribute.

Time out of mind the piratical proas of the Malays, lurking among the low shaded coves and islets of Sumatra, have sallied out upon the vessels sailing through the straits, fiercely demanding tribute at the point of their spears. Though by the repeated bloody chastisements they have received at the hands of European cruisers, the audacity of these corsairs has of late been somewhat repressed; yet, even at the present day, we occasionally hear of English and American vessels, which, in those waters, have been remorselessly boarded and pillaged.

With a fair, fresh wind, the Pequod was now drawing nigh to these straits; Ahab purposing to pass through them into the Javan sea, and thence, cruising northwards, over waters known to be frequented here and there by the Sperm Whale, sweep inshore by the Philippine Islands, and gain the far coast of Japan, in time for the great whaling season there. By these means, the circumnavigating Pequod would sweep almost all the known Sperm Whale cruising grounds of the world, previous to descending upon the Line in the Pacific; where Ahab, though everywhere else foiled in his pursuit, firmly counted upon giving battle to Moby Dick, in the sea he was most known to frequent; and at a season when he might most reasonably be presumed to be haunting it.

But how now? in this zoned quest, does Ahab touch no land? does his crew drink air? Surely, he will stop for water. Nay. For a long time, now, the circus-running sun has raced within his fiery ring, and needs no sustenance but what’s in himself. So Ahab. Mark this, too, in the whaler. While other hulls are loaded down with alien stuff, to be transferred to foreign wharves; the world-wandering whale-ship carries no cargo but herself and crew, their weapons and their wants. She has a whole lake’s contents bottled in her ample hold. She is ballasted with utilities; not altogether with unusable pig-lead and kentledge. She carries years’ water in her. Clear old prime Nantucket water; which, when three years afloat, the Nantucketer, in the Pacific, prefers to drink before the brackish fluid, but yesterday rafted off in casks, from the Peruvian or Indian streams. Hence it is, that, while other ships may have gone to China from New York, and back again, touching at a score of ports, the whale-ship, in all that interval, may not have sighted one grain of soil; her crew having seen no man but floating seamen like themselves. So that did you carry them the news that another flood had come; they would only answer—“Well, boys, here’s the ark!”

Now, as many Sperm Whales had been captured off the western coast of Java, in the near vicinity of the Straits of Sunda; indeed, as most of the ground, roundabout, was generally recognised by the fishermen as an excellent spot for cruising; therefore, as the Pequod gained more and more upon Java Head, the look-outs were repeatedly hailed, and admonished to keep wide awake. But though the green palmy cliffs of the land soon loomed on the starboard bow, and with delighted nostrils the fresh cinnamon was snuffed in the air, yet not a single jet was descried. Almost renouncing all thought of falling in with any game hereabouts, the ship had well nigh entered the straits, when the customary cheering cry was heard from aloft, and ere long a spectacle of singular magnificence saluted us.

But here be it premised, that owing to the unwearied activity with which of late they have been hunted over all four oceans, the Sperm Whales, instead of almost invariably sailing in small detached companies, as in former times, are now frequently met with in extensive herds, sometimes embracing so great a multitude, that it would almost seem as if numerous nations of them had sworn solemn league and covenant for mutual assistance and protection. To this aggregation of the Sperm Whale into such immense caravans, may be imputed the circumstance that even in the best cruising grounds, you may now sometimes sail for weeks and months together, without being greeted by a single spout; and then be suddenly saluted by what sometimes seems thousands on thousands.

Broad on both bows, at the distance of some two or three miles, and forming a great semicircle, embracing one half of the level horizon, a continuous chain of whale-jets were up-playing and sparkling in the noon-day air. Unlike the straight perpendicular twin-jets of the Right Whale, which, dividing at top, fall over in two branches, like the cleft drooping boughs of a willow, the single forward-slanting spout of the Sperm Whale presents a thick curled bush of white mist, continually rising and falling away to leeward.

Seen from the Pequod’s deck, then, as she would rise on a high hill of the sea, this host of vapory spouts, individually curling up into the air, and beheld through a blending atmosphere of bluish haze, showed like the thousand cheerful chimneys of some dense metropolis, descried of a balmy autumnal morning, by some horseman on a height.

As marching armies approaching an unfriendly defile in the mountains, accelerate their march, all eagerness to place that perilous passage in their rear, and once more expand in comparative security upon the plain; even so did this vast fleet of whales now seem hurrying forward through the straits; gradually contracting the wings of their semicircle, and swimming on, in one solid, but still crescentic centre.

Crowding all sail the Pequod pressed after them; the harpooneers handling their weapons, and loudly cheering from the heads of their yet suspended boats. If the wind only held, little doubt had they, that chased through these Straits of Sunda, the vast host would only deploy into the Oriental seas to witness the capture of not a few of their number. And who could tell whether, in that congregated caravan, Moby Dick himself might not temporarily be swimming, like the worshipped white-elephant in the coronation procession of the Siamese! So with stun-sail piled on stun-sail, we sailed along, driving these leviathans before us; when, of a sudden, the voice of Tashtego was heard, loudly directing attention to something in our wake.

Corresponding to the crescent in our van, we beheld another in our rear. It seemed formed of detached white vapors, rising and falling something like the spouts of the whales; only they did not so completely come and go; for they constantly hovered, without finally disappearing. Levelling his glass at this sight, Ahab quickly revolved in his pivot-hole, crying, “Aloft there, and rig whips and buckets to wet the sails;—Malays, sir, and after us!”

As if too long lurking behind the headlands, till the Pequod should fairly have entered the straits, these rascally Asiatics were now in hot pursuit, to make up for their over-cautious delay. But when the swift Pequod, with a fresh leading wind, was herself in hot chase; how very kind of these tawny philanthropists to assist in speeding her on to her own chosen pursuit,—mere riding-whips and rowels to her, that they were. As with glass under arm, Ahab to-and-fro paced the deck; in his forward turn beholding the monsters he chased, and in the after one the bloodthirsty pirates chasing him; some such fancy as the above seemed his. And when he glanced upon the green walls of the watery defile in which the ship was then sailing, and bethought him that through that gate lay the route to his vengeance, and beheld, how that through that same gate he was now both chasing and being chased to his deadly end; and not only that, but a herd of remorseless wild pirates and inhuman atheistical devils were infernally cheering him on with their curses;—when all these conceits had passed through his brain, Ahab’s brow was left gaunt and ribbed, like the black sand beach after some stormy tide has been gnawing it, without being able to drag the firm thing from its place.

But thoughts like these troubled very few of the reckless crew; and when, after steadily dropping and dropping the pirates astern, the Pequod at last shot by the vivid green Cockatoo Point on the Sumatra side, emerging at last upon the broad waters beyond; then, the harpooneers seemed more to grieve that the swift whales had been gaining upon the ship, than to rejoice that the ship had so victoriously gained upon the Malays. But still driving on in the wake of the whales, at length they seemed abating their speed; gradually the ship neared them; and the wind now dying away, word was passed to spring to the boats. But no sooner did the herd, by some presumed wonderful instinct of the Sperm Whale, become notified of the three keels that were after them,—though as yet a mile in their rear,—than they rallied again, and forming in close ranks and battalions, so that their spouts all looked like flashing lines of stacked bayonets, moved on with redoubled velocity.

Stripped to our shirts and drawers, we sprang to the white-ash, and after several hours’ pulling were almost disposed to renounce the chase, when a general pausing commotion among the whales gave animating token that they were now at last under the influence of that strange perplexity of inert irresolution, which, when the fishermen perceive it in the whale, they say he is gallied. The compact martial columns in which they had been hitherto rapidly and steadily swimming, were now broken up in one measureless rout; and like King Porus’ elephants in the Indian battle with Alexander, they seemed going mad with consternation. In all directions expanding in vast irregular circles, and aimlessly swimming hither and thither, by their short thick spoutings, they plainly betrayed their distraction of panic. This was still more strangely evinced by those of their number, who, completely paralysed as it were, helplessly floated like water-logged dismantled ships on the sea. Had these Leviathans been but a flock of simple sheep, pursued over the pasture by three fierce wolves, they could not possibly have evinced such excessive dismay. But this occasional timidity is characteristic of almost all herding creatures. Though banding together in tens of thousands, the lion-maned buffaloes of the West have fled before a solitary horseman. Witness, too, all human beings, how when herded together in the sheepfold of a theatre’s pit, they will, at the slightest alarm of fire, rush helter-skelter for the outlets, crowding, trampling, jamming, and remorselessly dashing each other to death. Best, therefore, withhold any amazement at the strangely gallied whales before us, for there is no folly of the beasts of the earth which is not infinitely outdone by the madness of men.

Though many of the whales, as has been said, were in violent motion, yet it is to be observed that as a whole the herd neither advanced nor retreated, but collectively remained in one place. As is customary in those cases, the boats at once separated, each making for some one lone whale on the outskirts of the shoal. In about three minutes’ time, Queequeg’s harpoon was flung; the stricken fish darted blinding spray in our faces, and then running away with us like light, steered straight for the heart of the herd. Though such a movement on the part of the whale struck under such circumstances, is in no wise unprecedented; and indeed is almost always more or less anticipated; yet does it present one of the more perilous vicissitudes of the fishery. For as the swift monster drags you deeper and deeper into the frantic shoal, you bid adieu to circumspect life and only exist in a delirious throb.

As, blind and deaf, the whale plunged forward, as if by sheer power of speed to rid himself of the iron leech that had fastened to him; as we thus tore a white gash in the sea, on all sides menaced as we flew, by the crazed creatures to and fro rushing about us; our beset boat was like a ship mobbed by ice-isles in a tempest, and striving to steer through their complicated channels and straits, knowing not at what moment it may be locked in and crushed.

But not a bit daunted, Queequeg steered us manfully; now sheering off from this monster directly across our route in advance; now edging away from that, whose colossal flukes were suspended overhead, while all the time, Starbuck stood up in the bows, lance in hand, pricking out of our way whatever whales he could reach by short darts, for there was no time to make long ones. Nor were the oarsmen quite idle, though their wonted duty was now altogether dispensed with. They chiefly attended to the shouting part of the business. “Out of the way, Commodore!” cried one, to a great dromedary that of a sudden rose bodily to the surface, and for an instant threatened to swamp us. “Hard down with your tail, there!” cried a second to another, which, close to our gunwale, seemed calmly cooling himself with his own fan-like extremity.

All whaleboats carry certain curious contrivances, originally invented by the Nantucket Indians, called druggs. Two thick squares of wood of equal size are stoutly clenched together, so that they cross each other’s grain at right angles; a line of considerable length is then attached to the middle of this block, and the other end of the line being looped, it can in a moment be fastened to a harpoon. It is chiefly among gallied whales that this drugg is used. For then, more whales are close round you than you can possibly chase at one time. But sperm whales are not every day encountered; while you may, then, you must kill all you can. And if you cannot kill them all at once, you must wing them, so that they can be afterwards killed at your leisure. Hence it is, that at times like these the drugg, comes into requisition. Our boat was furnished with three of them. The first and second were successfully darted, and we saw the whales staggeringly running off, fettered by the enormous sidelong resistance of the towing drugg. They were cramped like malefactors with the chain and ball. But upon flinging the third, in the act of tossing overboard the clumsy wooden block, it caught under one of the seats of the boat, and in an instant tore it out and carried it away, dropping the oarsman in the boat’s bottom as the seat slid from under him. On both sides the sea came in at the wounded planks, but we stuffed two or three drawers and shirts in, and so stopped the leaks for the time.

It had been next to impossible to dart these drugged-harpoons, were it not that as we advanced into the herd, our whale’s way greatly diminished; moreover, that as we went still further and further from the circumference of commotion, the direful disorders seemed waning. So that when at last the jerking harpoon drew out, and the towing whale sideways vanished; then, with the tapering force of his parting momentum, we glided between two whales into the innermost heart of the shoal, as if from some mountain torrent we had slid into a serene valley lake. Here the storms in the roaring glens between the outermost whales, were heard but not felt. In this central expanse the sea presented that smooth satin-like surface, called a sleek, produced by the subtle moisture thrown off by the whale in his more quiet moods. Yes, we were now in that enchanted calm which they say lurks at the heart of every commotion. And still in the distracted distance we beheld the tumults of the outer concentric circles, and saw successive pods of whales, eight or ten in each, swiftly going round and round, like multiplied spans of horses in a ring; and so closely shoulder to shoulder, that a Titanic circus-rider might easily have over-arched the middle ones, and so have gone round on their backs. Owing to the density of the crowd of reposing whales, more immediately surrounding the embayed axis of the herd, no possible chance of escape was at present afforded us. We must watch for a breach in the living wall that hemmed us in; the wall that had only admitted us in order to shut us up. Keeping at the centre of the lake, we were occasionally visited by small tame cows and calves; the women and children of this routed host.

Now, inclusive of the occasional wide intervals between the revolving outer circles, and inclusive of the spaces between the various pods in any one of those circles, the entire area at this juncture, embraced by the whole multitude, must have contained at least two or three square miles. At any rate—though indeed such a test at such a time might be deceptive—spoutings might be discovered from our low boat that seemed playing up almost from the rim of the horizon. I mention this circumstance, because, as if the cows and calves had been purposely locked up in this innermost fold; and as if the wide extent of the herd had hitherto prevented them from learning the precise cause of its stopping; or, possibly, being so young, unsophisticated, and every way innocent and inexperienced; however it may have been, these smaller whales—now and then visiting our becalmed boat from the margin of the lake—evinced a wondrous fearlessness and confidence, or else a still becharmed panic which it was impossible not to marvel at. Like household dogs they came snuffling round us, right up to our gunwales, and touching them; till it almost seemed that some spell had suddenly domesticated them. Queequeg patted their foreheads; Starbuck scratched their backs with his lance; but fearful of the consequences, for the time refrained from darting it.

But far beneath this wondrous world upon the surface, another and still stranger world met our eyes as we gazed over the side. For, suspended in those watery vaults, floated the forms of the nursing mothers of the whales, and those that by their enormous girth seemed shortly to become mothers. The lake, as I have hinted, was to a considerable depth exceedingly transparent; and as human infants while suckling will calmly and fixedly gaze away from the breast, as if leading two different lives at the time; and while yet drawing mortal nourishment, be still spiritually feasting upon some unearthly reminiscence;—even so did the young of these whales seem looking up towards us, but not at us, as if we were but a bit of Gulfweed in their new-born sight. Floating on their sides, the mothers also seemed quietly eyeing us. One of these little infants, that from certain queer tokens seemed hardly a day old, might have measured some fourteen feet in length, and some six feet in girth. He was a little frisky; though as yet his body seemed scarce yet recovered from that irksome position it had so lately occupied in the maternal reticule; where, tail to head, and all ready for the final spring, the unborn whale lies bent like a Tartar’s bow. The delicate side-fins, and the palms of his flukes, still freshly retained the plaited crumpled appearance of a baby’s ears newly arrived from foreign parts.

“Line! line!” cried Queequeg, looking over the gunwale; “him fast! him fast!—Who line him! Who struck?—Two whale; one big, one little!”

“What ails ye, man?” cried Starbuck.

“Look-e here,” said Queequeg, pointing down.

As when the stricken whale, that from the tub has reeled out hundreds of fathoms of rope; as, after deep sounding, he floats up again, and shows the slackened curling line buoyantly rising and spiralling towards the air; so now, Starbuck saw long coils of the umbilical cord of Madame Leviathan, by which the young cub seemed still tethered to its dam. Not seldom in the rapid vicissitudes of the chase, this natural line, with the maternal end loose, becomes entangled with the hempen one, so that the cub is thereby trapped. Some of the subtlest secrets of the seas seemed divulged to us in this enchanted pond. We saw young Leviathan amours in the deep.*

*The sperm whale, as with all other species of the Leviathan, but unlike most other fish, breeds indifferently at all seasons; after a gestation which may probably be set down at nine months, producing but one at a time; though in some few known instances giving birth to an Esau and Jacob:—a contingency provided for in suckling by two teats, curiously situated, one on each side of the anus; but the breasts themselves extend upwards from that. When by chance these precious parts in a nursing whale are cut by the hunter’s lance, the mother’s pouring milk and blood rivallingly discolour the sea for rods. The milk is very sweet and rich; it has been tasted by man; it might do well with strawberries. When overflowing with mutual esteem, the whales salute more hominum.

And thus, though surrounded by circle upon circle of consternations and affrights, did these inscrutable creatures at the centre freely and fearlessly indulge in all peaceful concernments; yea, serenely revelled in dalliance and delight. But even so, amid the tornadoed Atlantic of my being, do I myself still for ever centrally disport in mute calm; and while ponderous planets of unwaning woe revolve round me, deep down and deep inland there I still bathe me in eternal mildness of joy.

Meanwhile, as we thus lay entranced, the occasional sudden frantic spectacles in the distance evinced the activity of the other boats, still engaged in drugging the whales on the frontier of the host; or possibly carrying on the war within the first circle, where abundance of room and some convenient retreats were afforded them. But the sight of the enraged drugged whales now and then blindly darting to and fro across the circles, was nothing to what at last met our eyes. It is sometimes the custom when fast to a whale more than commonly powerful and alert, to seek to hamstring him, as it were, by sundering or maiming his gigantic tail-tendon. It is done by darting a short-handled cutting-spade, to which is attached a rope for hauling it back again. A whale wounded (as we afterwards learned) in this part, but not effectually, as it seemed, had broken away from the boat, carrying along with him half of the harpoon line; and in the extraordinary agony of the wound, he was now dashing among the revolving circles like the lone mounted desperado Arnold, at the battle of Saratoga, carrying dismay wherever he went.

But agonizing as was the wound of this whale, and an appalling spectacle enough, any way; yet the peculiar horror with which he seemed to inspire the rest of the herd, was owing to a cause which at first the intervening distance obscured from us. But at length we perceived that by one of the unimaginable accidents of the fishery, this whale had become entangled in the harpoon-line that he towed; he had also run away with the cutting-spade in him; and while the free end of the rope attached to that weapon, had permanently caught in the coils of the harpoon-line round his tail, the cutting-spade itself had worked loose from his flesh. So that tormented to madness, he was now churning through the water, violently flailing with his flexible tail, and tossing the keen spade about him, wounding and murdering his own comrades.

This terrific object seemed to recall the whole herd from their stationary fright. First, the whales forming the margin of our lake began to crowd a little, and tumble against each other, as if lifted by half spent billows from afar; then the lake itself began faintly to heave and swell; the submarine bridal-chambers and nurseries vanished; in more and more contracting orbits the whales in the more central circles began to swim in thickening clusters. Yes, the long calm was departing. A low advancing hum was soon heard; and then like to the tumultuous masses of block-ice when the great river Hudson breaks up in Spring, the entire host of whales came tumbling upon their inner centre, as if to pile themselves up in one common mountain. Instantly Starbuck and Queequeg changed places; Starbuck taking the stern.

“Oars! Oars!” he intensely whispered, seizing the helm—“gripe your oars, and clutch your souls, now! My God, men, stand by! Shove him off, you Queequeg—the whale there!—prick him!—hit him! Stand up—stand up, and stay so! Spring, men—pull, men; never mind their backs—scrape them!—scrape away!”

The boat was now all but jammed between two vast black bulks, leaving a narrow Dardanelles between their long lengths. But by desperate endeavor we at last shot into a temporary opening; then giving way rapidly, and at the same time earnestly watching for another outlet. After many similar hair-breadth escapes, we at last swiftly glided into what had just been one of the outer circles, but now crossed by random whales, all violently making for one centre. This lucky salvation was cheaply purchased by the loss of Queequeg’s hat, who, while standing in the bows to prick the fugitive whales, had his hat taken clean from his head by the air-eddy made by the sudden tossing of a pair of broad flukes close by.

Riotous and disordered as the universal commotion now was, it soon resolved itself into what seemed a systematic movement; for having clumped together at last in one dense body, they then renewed their onward flight with augmented fleetness. Further pursuit was useless; but the boats still lingered in their wake to pick up what drugged whales might be dropped astern, and likewise to secure one which Flask had killed and waifed. The waif is a pennoned pole, two or three of which are carried by every boat; and which, when additional game is at hand, are inserted upright into the floating body of a dead whale, both to mark its place on the sea, and also as token of prior possession, should the boats of any other ship draw near.

The result of this lowering was somewhat illustrative of that sagacious saying in the Fishery,—the more whales the less fish. Of all the drugged whales only one was captured. The rest contrived to escape for the time, but only to be taken, as will hereafter be seen, by some other craft than the Pequod.






CHAPTER 88. Schools and Schoolmasters.
The previous chapter gave account of an immense body or herd of Sperm Whales, and there was also then given the probable cause inducing those vast aggregations.

Now, though such great bodies are at times encountered, yet, as must have been seen, even at the present day, small detached bands are occasionally observed, embracing from twenty to fifty individuals each. Such bands are known as schools. They generally are of two sorts; those composed almost entirely of females, and those mustering none but young vigorous males, or bulls, as they are familiarly designated.

In cavalier attendance upon the school of females, you invariably see a male of full grown magnitude, but not old; who, upon any alarm, evinces his gallantry by falling in the rear and covering the flight of his ladies. In truth, this gentleman is a luxurious Ottoman, swimming about over the watery world, surroundingly accompanied by all the solaces and endearments of the harem. The contrast between this Ottoman and his concubines is striking; because, while he is always of the largest leviathanic proportions, the ladies, even at full growth, are not more than one-third of the bulk of an average-sized male. They are comparatively delicate, indeed; I dare say, not to exceed half a dozen yards round the waist. Nevertheless, it cannot be denied, t

*/