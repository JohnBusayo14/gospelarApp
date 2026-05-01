// seed.js — GOFAMINT Sunday School Complete Database Seed
// ─────────────────────────────────────────────────────────────────────────────
// Run: node seed.js
// Seeds: languages, units (all 4 categories), lessons (13 × adult),
//        lesson_translations (EN/YO/IG/HA), quiz questions, hymns
//
// Theme: Q4 2026 — "Demonstration of the Christian Life"
//        Exposition on the Book of Philemon (Philemon 1:1–25)
// ─────────────────────────────────────────────────────────────────────────────

const { Pool } = require('pg');
require('dotenv').config();

// ── Connection — supports both DATABASE_URL and individual env vars ──────────
// If DATABASE_URL is set, use it. Otherwise fall back to PG* vars.
// For local development on Windows/Mac, set these in your .env file:
//
//   DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/gofamint
//
// OR individual vars:
//   PGUSER=postgres
//   PGPASSWORD=yourpassword
//   PGHOST=localhost
//   PGPORT=5432
//   PGDATABASE=gofamint
//
// Reads your .env — supports DATABASE_URL, DB_* vars, or PG* vars
const db = new Pool(
  process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL }
    : {
        user:     process.env.DB_USER     || process.env.PGUSER     || 'postgres',
        password: process.env.DB_PASSWORD || process.env.PGPASSWORD || '',
        host:     process.env.DB_HOST     || process.env.PGHOST     || 'localhost',
        port:     parseInt(process.env.DB_PORT || process.env.PGPORT || '5432'),
        database: process.env.DB_NAME     || process.env.PGDATABASE || 'gospeler',
      }
);

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const run   = (sql, params = []) => db.query(sql, params);
const log   = (msg) => console.log(`  ✓  ${msg}`);
const warn  = (msg) => console.warn(`  ⚠  ${msg}`);

// ─────────────────────────────────────────────────────────────────────────────
// LANGUAGES
// ─────────────────────────────────────────────────────────────────────────────
const LANGUAGES = [
  { code: 'en', label: 'English', native_label: 'English',    flag: '🇬🇧' },
  { code: 'yo', label: 'Yoruba',  native_label: 'Yorùbá',     flag: '🇳🇬' },
  { code: 'ig', label: 'Igbo',    native_label: 'Ígbò',       flag: '🇳🇬' },
  { code: 'ha', label: 'Hausa',   native_label: 'Hausa',      flag: '🇳🇬' },
];

// ─────────────────────────────────────────────────────────────────────────────
// UNITS — 4 categories × 3 units each = 12 units
// ─────────────────────────────────────────────────────────────────────────────
const UNITS = [
  // ── ADULT ──
  {
    id: 'adult_unit_1', title: 'Introduction to the Christian Life',
    description: 'The foundation of Christian fellowship, identity and calling in Christ Jesus.',
    lesson_range: 'Lessons 1–4', color: '#7C3AED', sort_order: 1, category: 'adult',
  },
  {
    id: 'adult_unit_2', title: 'Practical Expressions of Christian Love',
    description: 'How forgiveness, reconciliation and service define the Christian witness.',
    lesson_range: 'Lessons 5–9', color: '#7C3AED', sort_order: 2, category: 'adult',
  },
  {
    id: 'adult_unit_3', title: 'The Christian Life in Society',
    description: 'Demonstrating Christian values in every relationship and sphere of life.',
    lesson_range: 'Lessons 10–13', color: '#7C3AED', sort_order: 3, category: 'adult',
  },

  // ── YOUTH ──
  {
    id: 'youth_unit_1', title: 'Who Am I in Christ?',
    description: 'Discovering your identity and purpose as a young Christian.',
    lesson_range: 'Lessons 1–4', color: '#2563EB', sort_order: 1, category: 'youth',
  },
  {
    id: 'youth_unit_2', title: 'Living Out My Faith',
    description: 'Practical steps to express your faith in school, family, and community.',
    lesson_range: 'Lessons 5–9', color: '#2563EB', sort_order: 2, category: 'youth',
  },
  {
    id: 'youth_unit_3', title: 'Christian Leadership and Service',
    description: 'Becoming a servant-leader who influences others for Christ.',
    lesson_range: 'Lessons 10–13', color: '#2563EB', sort_order: 3, category: 'youth',
  },

  // ── INTERMEDIATE ──
  {
    id: 'intermediate_unit_1', title: 'Growing in Grace',
    description: 'Learning the basic disciplines that strengthen the Christian character.',
    lesson_range: 'Lessons 1–4', color: '#10B981', sort_order: 1, category: 'intermediate',
  },
  {
    id: 'intermediate_unit_2', title: 'Friends and Fellowship',
    description: 'Understanding Christian friendship, forgiveness and community.',
    lesson_range: 'Lessons 5–9', color: '#10B981', sort_order: 2, category: 'intermediate',
  },
  {
    id: 'intermediate_unit_3', title: 'Serving God and Others',
    description: 'Discovering how to serve God by serving the people around us.',
    lesson_range: 'Lessons 10–13', color: '#10B981', sort_order: 3, category: 'intermediate',
  },

  // ── CHILDREN ──
  {
    id: 'children_unit_1', title: 'I Am God\'s Child',
    description: 'Simple truths about being loved and chosen by God.',
    lesson_range: 'Lessons 1–4', color: '#F97316', sort_order: 1, category: 'children',
  },
  {
    id: 'children_unit_2', title: 'Being Kind Like Jesus',
    description: 'Learning to be kind, helpful and forgiving like Jesus showed us.',
    lesson_range: 'Lessons 5–9', color: '#F97316', sort_order: 2, category: 'children',
  },
  {
    id: 'children_unit_3', title: 'Sharing God\'s Love',
    description: 'How to share God\'s love with family, friends and neighbours.',
    lesson_range: 'Lessons 10–13', color: '#F97316', sort_order: 3, category: 'children',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// LESSONS — 13 lessons. unit_id targets adult units;
//           same lesson content applies across categories (category-specific
//           topics are stored in lesson_translations.topic_for_*)
// ─────────────────────────────────────────────────────────────────────────────
const LESSONS = [
  {
    lesson_number: 1,
    unit_id: 'adult_unit_1',
    lesson_date: '4th October, 2026',
    title: 'A Bond That Transcends Social Barriers',
    topic: 'Christian fellowship unites people from all walks of life in Christ Jesus.',
    quarter_theme: 'Demonstration of the Christian Life',
    suggested_hymns: 'MHB 720, MHB 481, MHB 503',
    devotional_reading: 'Acts 10:34–48',
    memory_verse: 'I thank my God always, making mention of thee in my prayers, hearing of thy love and faith, which thou hast toward the Lord Jesus, and toward all saints.',
    memory_verse_passage: 'Philemon 1:4–5',
    lesson_background: 'The letter to Philemon stands as one of the most personal and touching epistles in the New Testament. Written by the Apostle Paul during his imprisonment, it addresses a delicate social situation involving Onesimus, a runaway slave, and his master Philemon, a wealthy Christian in Colossae. The genius of this letter lies not in its brevity but in what it reveals about the transforming power of Christian love and fellowship. Paul did not write to Philemon as a superior issuing a command, but as a brother in Christ appealing on the basis of love.',
    lesson_conclusion: 'The gospel of Jesus Christ breaks down every wall that human society has built. There is neither Jew nor Greek, slave nor free, for we are all one in Christ Jesus. As members of the body of Christ, we are called to demonstrate this unity practically in how we treat one another, especially those whom society considers inferior or unworthy.',
    lesson_part: [
      {
        part_topic: 'The Greeting of a Kingdom Family',
        part_para1: 'Paul opens his letter with a threefold greeting: grace and peace from God our Father and the Lord Jesus Christ (v.3). This greeting is more than a formality. It establishes the theological framework within which the entire letter must be understood. Philemon is not merely Paul\'s friend — he is a fellow worker, a partner in the gospel ministry. Apphia and Archippus are named alongside him, indicating that the Christian household was the basic unit of the early church community.',
        part_para2: 'The phrase "the church in thy house" (v.2) reveals that the first-century church gathered in homes, making Christian fellowship deeply personal and familial. Philemon\'s home was not just a residence — it was a sanctuary, a place where the kingdom of God was visibly expressed in shared worship, prayer, and mutual accountability. This domestic church setting made the situation with Onesimus all the more personal and the appeal all the more meaningful.',
      },
      {
        part_topic: 'Thanksgiving: A Portrait of Genuine Christian Character',
        part_para1: 'Paul expresses genuine thanksgiving for Philemon\'s love and faith (vv.4–5). This thanksgiving is not flattery — it is a recognition of a real spiritual reality. Philemon\'s love was already known among the saints. His faith was active toward the Lord Jesus. Paul prays that this faith would become "effectual" — that is, that it would produce concrete results in the situation at hand. True Christian character is never merely internal; it always produces outward expressions of love and service.',
        part_para2: 'The word "effectual" (v.6) comes from the Greek word energēs, meaning active or operative. Paul\'s prayer is that Philemon\'s faith would be energised and made visible in practical action. This is a pattern throughout the New Testament: genuine faith always produces works of love. A Christianity that remains only theoretical, confined to Sunday worship without touching daily relationships, has not yet grasped the full power of the gospel.',
      },
      {
        part_topic: 'The Joy of Christian Partnership',
        part_para1: 'Paul confesses that Philemon\'s love has brought him great joy and consolation (v.7). The word "bowels" (Greek: splagchna) refers to the seat of deepest emotions — what we would call the heart. The saints had been refreshed through Philemon. This is the mark of a true Christian: that your presence and actions leave others strengthened, encouraged, and renewed. Christian fellowship is not merely social interaction; it is a spiritual transaction that builds up the body of Christ.',
        part_para2: 'In a world that often leaves people depleted and discouraged, the Christian community is called to be a place of genuine refreshment. Philemon had understood this calling and had lived it out, and Paul now appeals to this same spirit of generous love as the foundation for what he is about to ask. The appeal to receive Onesimus is grounded not in legal obligation but in the established reality of Philemon\'s Christian character.',
      },
    ],
    questions: [
      'How does the greeting "grace and peace" set the tone for Christian relationships in the body of Christ?',
      'What does Paul\'s thanksgiving for Philemon reveal about what genuine Christian character looks like?',
      'In what practical ways can we "refresh the bowels of the saints" in our local church community today?',
      'How does the concept of "the church in thy house" apply to Christian family life in our generation?',
      'What does it mean for faith to be "effectual"? Share an example from your own experience.',
    ],
    devotional_days: [
      { day: 'Day 1 — Monday',    scripture: 'Philemon 1:1–3',  title: 'The Language of Kingdom Partnership' },
      { day: 'Day 2 — Tuesday',   scripture: 'Philemon 1:4–5',  title: 'A Faith That Others Can See' },
      { day: 'Day 3 — Wednesday', scripture: 'Philemon 1:6',    title: 'Faith That Works' },
      { day: 'Day 4 — Thursday',  scripture: 'Philemon 1:7',    title: 'Refreshing the Saints' },
      { day: 'Day 5 — Friday',    scripture: 'Romans 16:1–5',   title: 'Churches in Houses' },
      { day: 'Day 6 — Saturday',  scripture: 'Ephesians 2:14–22', title: 'One in Christ' },
    ],
    sort_order: 1,
    topic_for_adults: 'Christian fellowship unites people from all walks of life in Christ Jesus.',
    topic_for_youth: 'How friendship in Christ goes beyond background, tribe and social status.',
    topic_for_intermediate: 'Making friends with everyone because God loves everyone equally.',
    topic_for_children: 'Jesus wants us to be friends with everyone, just as He loves everyone.',
  },

  {
    lesson_number: 2,
    unit_id: 'adult_unit_1',
    lesson_date: '11th October, 2026',
    title: 'The Appeal of Love: A Better Way to Lead',
    topic: 'Christian leadership operates through love and persuasion, not coercion or power.',
    quarter_theme: 'Demonstration of the Christian Life',
    suggested_hymns: 'MHB 416, MHB 395, MHB 539',
    devotional_reading: '1 Corinthians 13:1–13',
    memory_verse: 'Therefore, though I might be much bold in Christ to enjoin thee that which is convenient, yet for love\'s sake I rather beseech thee, being such an one as Paul the aged, and now also a prisoner of Jesus Christ.',
    memory_verse_passage: 'Philemon 1:8–9',
    lesson_background: 'In a world that respected authority and hierarchy, Paul\'s approach to Philemon is revolutionary. As an apostle, Paul had every right to issue a directive that Philemon would be obligated to obey. But Paul deliberately sets aside his authority and chooses the path of love, describing himself as "Paul the aged" and "a prisoner of Jesus Christ." This self-description is not self-pity; it is a rhetorical and spiritual strategy to appeal at the deepest level of Philemon\'s Christian conscience.',
    lesson_conclusion: 'The appeal of love is always more powerful than the command of authority. When we appeal to one another through love, we give people the dignity of choosing right freely rather than compelling them to comply under pressure. This is the Spirit of Christ — He did not force us to love Him. He demonstrated His love toward us while we were yet sinners, and His love draws us freely to Himself. Christian leaders at every level would do well to learn this lesson from Paul.',
    lesson_part: [
      {
        part_topic: 'Authority Surrendered for the Sake of Love',
        part_para1: 'Paul begins his appeal with a striking acknowledgment: he could command, but he chooses not to (v.8). The Greek word translated "bold" (parrēsia) speaks of the frank, authoritative speech of someone who has the right to speak. Paul had apostolic authority. He could have written this letter as a command. Instead, he writes it as a request grounded in love. This is a profound demonstration of Christian humility — the willingness to set aside one\'s rights for the sake of a deeper principle.',
        part_para2: 'This pattern mirrors the kenosis of Christ described in Philippians 2:5–8, where Jesus emptied Himself, taking the form of a servant. Paul\'s refusal to use his authority is itself a Christological statement — it embodies the very principle he is asking Philemon to live out. The greatest leaders in the kingdom of God are those who know when to lay down their authority and lead through service and love instead.',
      },
      {
        part_topic: 'The Prisoner Who Speaks with Spiritual Authority',
        part_para1: 'Paul describes himself as "Paul the aged, and now also a prisoner of Jesus Christ" (v.9). This self-description carries great weight. He is not merely an old man in prison — he is a prisoner of Jesus Christ, one whose imprisonment is a badge of honour, a testimony to his total commitment to the gospel. His weakness in the eyes of the world becomes the very ground of his spiritual authority. This is the paradox of the kingdom: power is made perfect in weakness (2 Corinthians 12:9).',
        part_para2: 'It is from this position of apparent weakness that Paul makes his most powerful appeal. He is not leveraging social status, wealth, or connections. He is appealing from the place of suffering and love. The church today often seeks influence through power, wealth, and political connections. Paul\'s example challenges us to consider whether authentic Christian influence might flow more powerfully from vulnerability, sacrifice, and love than from the instruments of worldly power.',
      },
      {
        part_topic: 'Love as the Highest Christian Motivation',
        part_para1: '"For love\'s sake I rather beseech thee" (v.9). Love is the supreme motivation in Paul\'s appeal. It is not duty, obligation, or guilt that drives him — it is love. And it is not merely Paul\'s love for Onesimus or for Philemon — it is the love of Christ that constrains him (2 Corinthians 5:14). Christian ethics rooted in love always exceeds the requirements of law. Where law says "you must," love says "I want to, because I care for you."',
        part_para2: 'The demonstration of this kind of love in everyday relationships is one of the most powerful apologetics for the gospel. When the world sees Christians loving one another across the barriers of race, class, culture and past grievances, it catches a glimpse of the kingdom of God. The appeal to Philemon is ultimately an appeal to demonstrate this kingdom reality in the most personal and costly way possible — by receiving a runaway slave as a beloved brother.',
      },
    ],
    questions: [
      'Why do you think Paul chose to appeal through love rather than assert his apostolic authority?',
      'What does Paul\'s self-description as "a prisoner of Jesus Christ" teach us about Christian identity in suffering?',
      'How can Christian leaders in homes, churches and workplaces apply the principle of leading through love?',
      'When have you experienced someone appealing to you through love rather than authority? How did it affect you?',
      'What is the relationship between love and true freedom in making moral choices?',
    ],
    devotional_days: [
      { day: 'Day 1 — Monday',    scripture: 'Philemon 1:8–9',      title: 'The Power of a Gentle Appeal' },
      { day: 'Day 2 — Tuesday',   scripture: 'Philippians 2:5–8',   title: 'The Mind of Christ in Leadership' },
      { day: 'Day 3 — Wednesday', scripture: '1 Corinthians 13:4–8', title: 'What Love Looks Like' },
      { day: 'Day 4 — Thursday',  scripture: '2 Corinthians 12:7–10', title: 'Strength in Weakness' },
      { day: 'Day 5 — Friday',    scripture: 'Matthew 20:25–28',    title: 'Servant Leadership' },
      { day: 'Day 6 — Saturday',  scripture: 'Galatians 5:13–14',   title: 'Freedom Used in Love' },
    ],
    sort_order: 2,
    topic_for_adults: 'Christian leadership operates through love and persuasion, not coercion or power.',
    topic_for_youth: 'How to influence your peers through love and example, not pressure or manipulation.',
    topic_for_intermediate: 'Being a leader among friends by caring more and demanding less.',
    topic_for_children: 'We can lead others by showing kindness and love, not by forcing them.',
  },

  {
    lesson_number: 3,
    unit_id: 'adult_unit_1',
    lesson_date: '18th October, 2026',
    title: 'Transformed by Grace: The Story of Onesimus',
    topic: 'The grace of God transforms the worst sinner into a profitable servant of Christ.',
    quarter_theme: 'Demonstration of the Christian Life',
    suggested_hymns: 'MHB 290, MHB 362, MHB 441',
    devotional_reading: '1 Corinthians 6:9–11',
    memory_verse: 'Which in time past was to thee unprofitable, but now profitable to thee and to me.',
    memory_verse_passage: 'Philemon 1:11',
    lesson_background: 'Onesimus is one of the most dramatic conversion stories in the New Testament. His name in Greek literally means "useful" or "profitable" — a common name given to slaves in the ancient world. But the irony is that when he ran away from Philemon, he became the very opposite of his name. A runaway slave in the Roman world faced severe consequences if caught, including branding, chains, and sometimes death. Yet through a remarkable providence, Onesimus found his way to Paul in prison and was converted to Christ.',
    lesson_conclusion: 'No one is beyond the reach of God\'s grace. Onesimus was a thief, a runaway, and a social outcast — yet God met him in his need. His transformation is a testament to the power of the gospel to renovate the deepest recesses of the human personality. The church today must be a community that believes in and demonstrates the transforming power of grace — a community where people are received not on the basis of their past but on the basis of what Christ has made them.',
    lesson_part: [
      {
        part_topic: 'From Unprofitable to Profitable: The Power of Conversion',
        part_para1: 'Paul plays on the meaning of Onesimus\'s name in verse 11: "which in time past was to thee unprofitable, but now profitable to thee and to me." This is more than wordplay — it is a theological statement about the transforming power of grace. Before his conversion, Onesimus was a liability. After his conversion, he became an asset. This is the miracle of regeneration: God takes what is broken, corrupted, and useless and transforms it into something beautiful and serviceable for His kingdom.',
        part_para2: 'This transformation did not happen through education, rehabilitation programs, or social upliftment. It happened through a personal encounter with the gospel of Jesus Christ. Paul, despite being a prisoner himself, invested in Onesimus and led him to faith. This models an important principle: the most powerful ministry often happens not in grand cathedrals but in the most unlikely, constrained circumstances. Prison becomes a mission field. Weakness becomes the seedbed of transformation.',
      },
      {
        part_topic: 'The Role of the Church in Transformation',
        part_para1: 'Paul describes Onesimus as "my own bowels" (v.12) — as dear to him as his very own heart. This intimate language reveals the depth of pastoral care that Paul had invested in Onesimus. He did not merely lead him to the sinner\'s prayer and move on. He nurtured, discipled, and formed a deep bond with this new convert. The church\'s calling in every generation is not simply to win converts but to make disciples — to invest deeply in the spiritual formation of new believers.',
        part_para2: 'Onesimus became so valuable to Paul that he says he could have kept him to serve him in the stead of Philemon (v.13). But Paul does not act unilaterally. He will not retain Onesimus without Philemon\'s consent, because he understands that the situation requires resolution at the deepest level — not just practical convenience but genuine reconciliation. True transformation in the gospel always leads to the restoration of broken relationships, not just personal improvement.',
      },
      {
        part_topic: 'Providence in the Story of Onesimus',
        part_para1: 'Paul suggests that Onesimus\'s running away might have been part of a divine plan: "For perhaps he therefore departed for a season, that thou shouldest receive him for ever" (v.15). This is a breathtaking example of Paul\'s theological perspective — he looks at what appeared to be a crisis of sin and failure and sees in it the hand of God working toward a greater good. The God of the Bible is sovereign over even our failures, our sins, and our worst decisions.',
        part_para2: 'This does not excuse Onesimus\'s actions — sin is still sin. But it invites us to look at the painful chapters of our lives and the lives of others with the eyes of faith. God can redeem what we have broken. He can bring beauty from ashes. He can turn our greatest failures into the very doorway through which we walk into our true calling. The story of Onesimus is a microcosm of the entire gospel story — the story of how God takes what is lost and makes it found.',
      },
    ],
    questions: [
      'What does the transformation of Onesimus reveal about the nature and power of the gospel?',
      'How should the church today treat people who come to Christ with a complicated or sinful past?',
      'Can you identify a situation in your own life where what appeared to be a disaster was later revealed as part of God\'s plan?',
      'What does deep pastoral care look like in your local church context? How can you invest in new believers around you?',
      'How does the concept of God\'s sovereignty over our failures comfort and challenge you?',
    ],
    devotional_days: [
      { day: 'Day 1 — Monday',    scripture: 'Philemon 1:10–13',   title: 'Born in Chains, Free in Christ' },
      { day: 'Day 2 — Tuesday',   scripture: '2 Corinthians 5:17', title: 'New Creation' },
      { day: 'Day 3 — Wednesday', scripture: 'Ezekiel 36:25–27',   title: 'God\'s Transforming Work' },
      { day: 'Day 4 — Thursday',  scripture: 'Luke 15:11–24',      title: 'The Father Who Runs' },
      { day: 'Day 5 — Friday',    scripture: 'Romans 8:28–30',     title: 'All Things Work Together' },
      { day: 'Day 6 — Saturday',  scripture: '1 Timothy 1:12–16',  title: 'The Chief of Sinners Saved' },
    ],
    sort_order: 3,
    topic_for_adults: 'The grace of God transforms the worst sinner into a profitable servant of Christ.',
    topic_for_youth: 'Your past does not define your future — God can transform anyone.',
    topic_for_intermediate: 'God can change people who have made mistakes into something wonderful.',
    topic_for_children: 'God can change bad things into good things when we trust Jesus.',
  },

  {
    lesson_number: 4,
    unit_id: 'adult_unit_1',
    lesson_date: '25th October, 2026',
    title: 'Christian Identity: No Longer a Slave',
    topic: 'In Christ, social and legal categories are transcended by a higher identity as brothers and sisters.',
    quarter_theme: 'Demonstration of the Christian Life',
    suggested_hymns: 'MHB 216, MHB 465, MHB 528',
    devotional_reading: 'Galatians 3:26–4:7',
    memory_verse: 'Not now as a servant, but above a servant, a brother beloved, specially to me, but how much more unto thee, both in the flesh, and in the Lord?',
    memory_verse_passage: 'Philemon 1:16',
    lesson_background: 'Verse 16 is arguably the most revolutionary sentence in the entire letter and one of the most radical statements in the New Testament regarding human dignity. Paul does not merely ask Philemon to be lenient with Onesimus — he asks him to receive him "not now as a servant, but above a servant, a brother beloved." This went far beyond anything that Roman law or social convention required or even permitted. It was nothing less than a call for a social revolution grounded in the gospel.',
    lesson_conclusion: 'The gospel does not abolish social structures overnight, but it plants a seed of transformation that eventually bears revolutionary fruit. Paul\'s words to Philemon were not merely private counsel; they were a declaration of a kingdom principle that would eventually undermine the entire institution of slavery. When the church truly lives out the identity of brotherhood in Christ, no human system of degradation or exploitation can ultimately stand. Our calling today is to live this out in the social structures and inequalities of our own time.',
    lesson_part: [
      {
        part_topic: 'A Brotherhood That Transcends Legal Categories',
        part_para1: 'Paul\'s request is radical: receive Onesimus "not now as a servant, but above a servant, a brother beloved" (v.16). The Roman legal system was absolute in its definition of a slave. A slave was property, not a person with rights. But the gospel declares a higher law: in Christ, the legal category of "slave" is not the final or most important word about a human being. Every person bears the image of God, and every believer in Christ shares a dignity that transcends all earthly social classifications.',
        part_para2: 'This is not merely abstract theology — it is a concrete demand on Philemon\'s behaviour toward Onesimus. He must treat him differently. He must see him differently. He must relate to him differently. The gospel of Jesus Christ is not truly received until it changes how we see and treat the people around us, especially those whom society has classified as inferior or unworthy. Christian belief that does not produce this kind of relational transformation is incomplete belief.',
      },
      {
        part_topic: 'The Weight of the Word "Brother"',
        part_para1: 'Paul calls Onesimus "a brother beloved, specially to me, but how much more unto thee, both in the flesh, and in the Lord" (v.16). The word "brother" in the New Testament carries extraordinary weight. It describes the fundamental relationship of all believers to one another in the family of God. To call Onesimus "brother" is to declare that he belongs to the same family, shares the same Father, possesses the same inheritance, and deserves the same honour that any member of the family of God deserves.',
        part_para2: 'Paul adds a beautiful phrase: "both in the flesh, and in the Lord." This is significant. Onesimus is not merely Philemon\'s spiritual brother in a vague, mystical sense — they are connected in concrete, physical reality. They share a household, a history, and now, through Christ, a future. The gospel does not allow us to remain in abstract spiritual brotherhood while maintaining practical inequality and contempt in our everyday dealings. Brotherhood in the Lord must be expressed in the flesh.',
      },
      {
        part_topic: 'Implications for the Church\'s Social Witness',
        part_para1: 'The household of Philemon, where the local church gathered, was about to receive a dramatic demonstration of the gospel\'s power to transform social relationships. When Onesimus walked back through that door — not as a runaway slave but as a beloved brother — every member of that house church would witness something extraordinary. The gospel was not just a message about personal salvation; it was a social force that was already beginning to reshape the world.',
        part_para2: 'The church in every generation faces the challenge of making this visible. Wherever there are divisions — racial, economic, cultural, generational — the church is called to be a community where those divisions are actively being overcome by the power of the gospel. This is not a secondary mission or a political agenda; it is the very nature of the kingdom of God. Paul\'s brief letter to Philemon contains a vision of Christian community that the world has never fully seen and that the church has never fully lived — but must keep striving toward.',
      },
    ],
    questions: [
      'How does the concept of "brotherhood in Christ" challenge social and economic inequalities in your community?',
      'Why do you think Paul says Onesimus is a brother "both in the flesh, and in the Lord"? What is the significance of each phrase?',
      'What would it look like for your church to receive someone from a different social background as a full and equal member of the family?',
      'How does Paul\'s letter to Philemon speak to issues of racism, classism, or tribalism that exist in Nigerian society today?',
      'In what practical ways can you demonstrate "brotherhood in the Lord" to someone in your congregation this week?',
    ],
    devotional_days: [
      { day: 'Day 1 — Monday',    scripture: 'Philemon 1:14–16',     title: 'Above a Servant' },
      { day: 'Day 2 — Tuesday',   scripture: 'Galatians 3:26–29',    title: 'All One in Christ Jesus' },
      { day: 'Day 3 — Wednesday', scripture: 'James 2:1–9',          title: 'No Favouritism in the Kingdom' },
      { day: 'Day 4 — Thursday',  scripture: 'Acts 17:26–28',        title: 'One Blood, One Family' },
      { day: 'Day 5 — Friday',    scripture: 'Colossians 3:10–11',   title: 'The New Man in Christ' },
      { day: 'Day 6 — Saturday',  scripture: 'Revelation 7:9–10',    title: 'Every Nation Before the Throne' },
    ],
    sort_order: 4,
    topic_for_adults: 'In Christ, social and legal categories are transcended by a higher identity as brothers and sisters.',
    topic_for_youth: 'Tribe, class and background do not define who you are — Christ does.',
    topic_for_intermediate: 'In God\'s family, nobody is better than anyone else.',
    topic_for_children: 'We are all God\'s children and should treat everyone like family.',
  },

  {
    lesson_number: 5,
    unit_id: 'adult_unit_2',
    lesson_date: '1st November, 2026',
    title: 'Forgiveness: The Heart of Christian Community',
    topic: 'Christian forgiveness is not weakness but the most powerful force in human relationships.',
    quarter_theme: 'Demonstration of the Christian Life',
    suggested_hymns: 'MHB 362, MHB 294, MHB 512',
    devotional_reading: 'Matthew 18:21–35',
    memory_verse: 'If he hath wronged thee, or oweth thee ought, put that on mine account; I Paul have written it with mine own hand, I will repay it.',
    memory_verse_passage: 'Philemon 1:18–19a',
    lesson_background: 'Forgiveness is one of the most demanding requirements of Christian discipleship. In offering to pay Onesimus\'s debt himself, Paul performs a remarkable act of substitutionary intercession — he literally steps between the wrongdoer and the wronged party, offering to absorb the cost of the wrong himself. This is nothing less than an enacted parable of the atonement. Just as Christ stood between sinful humanity and a holy God and absorbed the cost of our sin, Paul stands between Onesimus and Philemon, absorbing the financial cost of Onesimus\'s wrong.',
    lesson_conclusion: 'Forgiveness is not the absence of justice — it is the willingness to absorb the cost of another\'s wrong rather than demanding that they pay it in full. It is the most expensive gift one human being can give to another. It is also the most Christlike act available to us. When we forgive, we are not excusing the wrong — we are refusing to let the wrong continue to define the relationship. We are choosing the future over the past, and we are participating in the very nature of God.',
    lesson_part: [
      {
        part_topic: 'The Debt That Could Not Be Ignored',
        part_para1: 'Onesimus had wronged Philemon — and Paul acknowledges this plainly: "If he hath wronged thee, or oweth thee ought" (v.18). Christian forgiveness does not begin with pretending that the wrong never happened. It begins with an honest acknowledgment of the reality of the offence. Paul does not minimise what Onesimus did. He does not offer Philemon a theological argument for why the offence didn\'t really matter. He admits that there was a real debt, a real wrong, a real breach in the relationship.',
        part_para2: 'This honest acknowledgment is crucial to genuine forgiveness. Cheap forgiveness that glosses over the real nature of the offence is not biblical forgiveness — it is a form of denial that ultimately does not heal. True forgiveness begins where Paul begins: with eyes wide open to the reality of the wrong, and then, with that reality fully in view, makes the costly choice to absorb the debt rather than exact it. This is the costly grace that Dietrich Bonhoeffer wrote about — it costs everything.',
      },
      {
        part_topic: 'Paul\'s Substitutionary Intercession',
        part_para1: '"Put that on mine account; I Paul have written it with mine own hand, I will repay it" (vv.18–19). Paul\'s offer is staggering in its generosity. He writes with his own hand — making it legally binding — that he will personally repay whatever Onesimus owes. This is not a vague spiritual promise. It is a specific, concrete, legally enforceable commitment. Paul is willing to bear the financial cost of Onesimus\'s past in order to secure his future. This is love in its most practical and costly form.',
        part_para2: 'Christian scholars have long recognized in this offer a parable of the atonement. Just as Christ bore the cost of our sin that we might be reconciled to God, Paul bears the cost of Onesimus\'s wrong that he might be reconciled to Philemon. The gospel does not merely talk about forgiveness in abstract terms — it demonstrates it concretely in the life of the apostle. Paul embodies the very message he preaches. This is the integrity of authentic Christian witness.',
      },
      {
        part_topic: 'The Gentle Reminder and the Spirit of Forgiveness',
        part_para1: 'Paul cannot resist a gentle aside: "albeit I do not say to thee how thou owest unto me even thine own self besides" (v.19b). This is not manipulation — it is a gracious reminder that the relationship between Paul and Philemon already involves a profound debt. Paul was instrumental in Philemon\'s own conversion. Philemon owes Paul the most priceless thing in existence — his eternal soul. In the light of that debt, how could Philemon refuse to forgive the far smaller debt of Onesimus?',
        part_para2: 'This is the logic of Christian forgiveness: the awareness of how much we ourselves have been forgiven makes it impossible to withhold forgiveness from others. Jesus articulated this same principle in the parable of the unmerciful servant (Matthew 18:21–35). The servant who had been forgiven a debt of millions of denarii refused to forgive a fellow servant a debt of a hundred. The gross disproportionality of his refusal revealed the hardness of his heart and his failure to truly receive what had been given to him.',
      },
    ],
    questions: [
      'How does Paul\'s offer to repay Onesimus\'s debt illuminate the doctrine of the atonement?',
      'Why is it important to begin forgiveness with an honest acknowledgment of the real nature of the wrong, rather than minimising it?',
      'How does remembering how much God has forgiven us change our capacity to forgive others?',
      'What is the difference between forgiveness and reconciliation? Are they always the same thing?',
      'Share a situation where you found it difficult to forgive someone. What helped you or hindered you?',
    ],
    devotional_days: [
      { day: 'Day 1 — Monday',    scripture: 'Philemon 1:17–19',   title: 'Put It On My Account' },
      { day: 'Day 2 — Tuesday',   scripture: 'Matthew 18:21–35',   title: 'The Math of Forgiveness' },
      { day: 'Day 3 — Wednesday', scripture: 'Ephesians 4:31–32',  title: 'Forgiving as God Forgave' },
      { day: 'Day 4 — Thursday',  scripture: 'Colossians 3:12–13', title: 'The Forgiving Community' },
      { day: 'Day 5 — Friday',    scripture: 'Luke 7:41–47',       title: 'Much Forgiven, Much Love' },
      { day: 'Day 6 — Saturday',  scripture: 'Isaiah 43:25',       title: 'God Who Blots Out Transgressions' },
    ],
    sort_order: 5,
    topic_for_adults: 'Christian forgiveness is not weakness but the most powerful force in human relationships.',
    topic_for_youth: 'Why forgiving others is actually the strongest thing you can do.',
    topic_for_intermediate: 'Forgiving people who hurt us is hard but it makes our hearts free.',
    topic_for_children: 'Jesus forgives us, so we can forgive our friends too.',
  },

  {
    lesson_number: 6,
    unit_id: 'adult_unit_2',
    lesson_date: '8th November, 2026',
    title: 'Reconciliation: Restoring Broken Relationships',
    topic: 'The gospel compels Christians to pursue reconciliation as a demonstration of God\'s grace.',
    quarter_theme: 'Demonstration of the Christian Life',
    suggested_hymns: 'MHB 503, MHB 467, MHB 291',
    devotional_reading: '2 Corinthians 5:17–21',
    memory_verse: 'Yea, brother, let me have joy of thee in the Lord: refresh my bowels in the Lord.',
    memory_verse_passage: 'Philemon 1:20',
    lesson_background: 'Reconciliation is one of the central themes of the Christian gospel. God in Christ was reconciling the world to Himself (2 Corinthians 5:19). This divine reconciliation between God and humanity is meant to produce horizontal reconciliation between human beings. The letter to Philemon is, among other things, a letter about reconciliation — the restoration of a broken relationship between a master and a slave who have both been transformed by the same gospel.',
    lesson_conclusion: 'The ministry of reconciliation is not optional for the Christian — it is a fundamental dimension of the gospel witness. When the church is seen as a community where broken relationships are healed, where enemies become brothers, and where the past is redeemed by grace, it speaks more powerfully than a thousand sermons. The world desperately needs to see this today — in families torn apart by bitterness, in communities divided by tribal and ethnic animosities, in workplaces and neighbourhoods fractured by suspicion and resentment.',
    lesson_part: [
      {
        part_topic: 'What Reconciliation Requires',
        part_para1: 'True reconciliation is not mere civility or the agreement to coexist in the same space while nursing inner resentment. It is the restoration of genuine relationship — the rebuilding of trust, the reestablishment of meaningful connection, and the willingness to move forward without allowing the past to constantly intrude upon the present. Paul is asking for something far deeper than a grudging toleration of Onesimus. He is asking for a joyful reception of him as a beloved brother.',
        part_para2: 'Verse 20 reveals what Paul most deeply desires: "Let me have joy of thee in the Lord: refresh my bowels in the Lord." Paul longs to hear that the reconciliation has happened and that it has happened fully and joyfully. Half-hearted reconciliation that merely goes through the external motions without genuine inner restoration is not what Paul envisions. The gospel demands and empowers genuine relational healing, and Paul believes Philemon is capable of it.',
      },
      {
        part_topic: 'The Cost of Genuine Reconciliation',
        part_para1: 'Reconciliation always costs something. For Onesimus, it cost the risk of returning to a master he had wronged, with no guarantee of how he would be received. For Philemon, it cost the surrender of his legitimate grievance against a slave who had wronged him and the relinquishment of his legal rights over Onesimus. For Paul, it cost the loss of a valuable co-worker and the effort of writing a careful, potentially humiliating letter of intercession. No party in this drama achieves reconciliation without cost.',
        part_para2: 'This is always the nature of genuine reconciliation. It requires vulnerability from both parties — the willingness of the offender to approach the person they have wronged, and the willingness of the offended to set aside their justified grievance. In our pride-driven culture, both kinds of vulnerability are extremely difficult. But the gospel equips us for both. Christ Himself demonstrated the ultimate vulnerability of reconciliation — approaching us in our sin with love rather than condemnation.',
      },
      {
        part_topic: 'Reconciliation as Kingdom Witness',
        part_para1: 'When Philemon receives Onesimus as a brother, the entire church that meets in his house witnesses something extraordinary. They see a master and a former slave sitting at the same table, worshipping the same Lord, equal before the same God. This act of reconciliation becomes a proclamation of the gospel more powerful than words. It demonstrates concretely what the gospel claims abstractly — that God is reconciling all things in Christ.',
        part_para2: 'The church in every age is called to be this kind of community — a community of reconciliation, a place where broken relationships are healed and where the healing power of the gospel is made visible. Nigeria\'s complex social, ethnic, and religious landscape presents the church with urgent opportunities to demonstrate this reconciling work. When Christians from different tribes worship, work, and live together as genuine brothers and sisters, they bear witness to a reality that transcends the divisions of our world.',
      },
    ],
    questions: [
      'What is the difference between reconciliation and mere tolerance? Why does Paul demand genuine reconciliation?',
      'What does genuine reconciliation cost each of the three parties in the Philemon story?',
      'How can the church become a more visible community of reconciliation in Nigeria\'s divided social landscape?',
      'Describe a situation where you witnessed or experienced genuine reconciliation. What made it possible?',
      'How does 2 Corinthians 5:18–19 connect the vertical reconciliation with God to horizontal reconciliation between people?',
    ],
    devotional_days: [
      { day: 'Day 1 — Monday',    scripture: 'Philemon 1:20–22',   title: 'Joy in Reconciliation' },
      { day: 'Day 2 — Tuesday',   scripture: '2 Corinthians 5:18–21', title: 'Ambassadors of Reconciliation' },
      { day: 'Day 3 — Wednesday', scripture: 'Matthew 5:23–24',    title: 'Be Reconciled First' },
      { day: 'Day 4 — Thursday',  scripture: 'Genesis 45:1–15',    title: 'Joseph and His Brothers' },
      { day: 'Day 5 — Friday',    scripture: 'Luke 15:20–24',      title: 'The Father\'s Embrace' },
      { day: 'Day 6 — Saturday',  scripture: 'Romans 5:10–11',     title: 'Reconciled Through Christ' },
    ],
    sort_order: 6,
    topic_for_adults: 'The gospel compels Christians to pursue reconciliation as a demonstration of God\'s grace.',
    topic_for_youth: 'Making peace with people you have hurt or who have hurt you.',
    topic_for_intermediate: 'How to fix friendships that have been broken.',
    topic_for_children: 'Saying sorry and making up with friends shows God\'s love.',
  },

  {
    lesson_number: 7,
    unit_id: 'adult_unit_2',
    lesson_date: '15th November, 2026',
    title: 'Christian Hospitality: Opening Hearts and Homes',
    topic: 'Hospitality is a tangible expression of Christian love that builds the community of faith.',
    quarter_theme: 'Demonstration of the Christian Life',
    suggested_hymns: 'MHB 395, MHB 719, MHB 480',
    devotional_reading: 'Romans 12:9–21',
    memory_verse: 'Having confidence in thy obedience I wrote unto thee, knowing that thou wilt also do more than I say.',
    memory_verse_passage: 'Philemon 1:21',
    lesson_background: 'In the ancient world, hospitality was not merely a social nicety — it was a moral and religious obligation. The stranger at the door could be an angel, a prophet, or a messenger from God. For the early church, hospitality was elevated to a theological necessity. The community that gathered in homes, shared meals together, and opened their doors to travelling missionaries was the visible body of Christ in the world. Paul\'s request to Philemon — "prepare me also a lodging" (v.22) — is embedded in this rich tradition of Christian hospitality.',
    lesson_conclusion: 'Christian hospitality is one of the most neglected yet most powerful expressions of Christian love in our contemporary world. In an era of individualism, privacy, and closed doors, the open home and open table of the Christian community speak prophetically of the kingdom of God. When we open our homes to strangers, to the lonely, to those from different social backgrounds, we enact the welcome that God has extended to all of us in Christ. "Be not forgetful to entertain strangers: for thereby some have entertained angels unawares" (Hebrews 13:2).',
    lesson_part: [
      {
        part_topic: 'The Theology of the Open Door',
        part_para1: 'Paul concludes his appeal to Philemon with a personal request: "prepare me also a lodging: for I trust that through your prayers I shall be given unto you" (v.22). This request reveals the intimate, personal nature of Christian community. Paul is not a distant theological authority — he is a friend, a brother, someone who hopes to visit soon and share fellowship. The open door and the prepared room are symbols of the entire spirit of the letter: a spirit of welcome, of making room for the other.',
        part_para2: 'The early church understood that Christian community was fundamentally incarnational — it had to be embodied in real spaces, real meals, real relationships. You cannot truly be the body of Christ through digital connection alone. The table fellowship of the early Christians was a sacramental act — it made visible the reality that all who share in Christ share in one another. The open home is still one of the most powerful instruments of Christian mission and community building in the world.',
      },
      {
        part_topic: 'Confidence in Christian Obedience',
        part_para1: '"Having confidence in thy obedience I wrote unto thee, knowing that thou wilt also do more than I say" (v.21). This is one of the most beautiful expressions of Christian confidence in another believer in the entire New Testament. Paul does not coerce, manipulate, or threaten. He simply expresses his confidence that Philemon will do the right thing — and even more than the right thing. He believes in the power of the gospel to produce generous, joyful obedience in a genuine Christian.',
        part_para2: 'This principle of expecting the best from fellow believers is a form of radical grace. When we extend this kind of confidence to one another, we create the conditions for growth. People tend to live up to the expectations of those who believe in them. Paul\'s confidence in Philemon is itself a form of love — it is the love that sees what a person can be, not merely what they have been, and calls them upward to their best selves.',
      },
      {
        part_topic: 'The Legacy of the Philemon Community',
        part_para1: 'The church that gathered in Philemon\'s house was about to witness something that would shape their understanding of the gospel forever. They would see Onesimus received not as a runaway slave, but as a beloved brother. They would see Philemon exercise the costly grace of forgiveness. They would experience the practical hospitality of a home opened wide to Paul. And in all of this, they would see the gospel demonstrated, not merely proclaimed.',
        part_para2: 'This is the legacy that every local church is called to create. Not merely a community that talks about the gospel but one that demonstrates it — in its treatment of the poor and wealthy alike, in its crossing of ethnic and social boundaries, in its practice of forgiveness and reconciliation, and in its radical hospitality. The watching world is not primarily persuaded by theological arguments. It is persuaded by communities where the gospel can be seen, touched, and experienced.',
      },
    ],
    questions: [
      'What is the theological significance of hospitality in the New Testament? How does it connect to the gospel?',
      'Why do you think Paul expresses confidence that Philemon will do "more than I say"? What does this reveal about the nature of Christian love?',
      'How can your home, family, or church become a more hospitable community?',
      'What are the barriers to genuine Christian hospitality in our contemporary Nigerian context?',
      'How does the open table of the early church connect to our celebration of Holy Communion today?',
    ],
    devotional_days: [
      { day: 'Day 1 — Monday',    scripture: 'Philemon 1:21–25',   title: 'Prepared for the Guest' },
      { day: 'Day 2 — Tuesday',   scripture: 'Romans 12:13',       title: 'Given to Hospitality' },
      { day: 'Day 3 — Wednesday', scripture: 'Hebrews 13:1–2',     title: 'Entertaining Angels' },
      { day: 'Day 4 — Thursday',  scripture: 'Luke 14:12–14',      title: 'The Banquet of the Kingdom' },
      { day: 'Day 5 — Friday',    scripture: '1 Peter 4:8–10',     title: 'Hospitality Without Grudging' },
      { day: 'Day 6 — Saturday',  scripture: 'Revelation 3:20',    title: 'The Lord at the Door' },
    ],
    sort_order: 7,
    topic_for_adults: 'Hospitality is a tangible expression of Christian love that builds the community of faith.',
    topic_for_youth: 'How welcoming others into your life and space reflects the love of Christ.',
    topic_for_intermediate: 'Being friendly and welcoming to others is part of following Jesus.',
    topic_for_children: 'We can show God\'s love by being welcoming and kind to visitors.',
  },

  {
    lesson_number: 8,
    unit_id: 'adult_unit_2',
    lesson_date: '22nd November, 2026',
    title: 'Intercession: Standing in the Gap for Others',
    topic: 'Christian intercession is a ministry of love that reflects the heart of our Great High Priest.',
    quarter_theme: 'Demonstration of the Christian Life',
    suggested_hymns: 'MHB 530, MHB 427, MHB 441',
    devotional_reading: 'Hebrews 7:23–27',
    memory_verse: 'Wherefore he is able also to save them to the uttermost that come unto God by him, seeing he ever liveth to make intercession for them.',
    memory_verse_passage: 'Hebrews 7:25',
    lesson_background: 'The letter to Philemon is, at its core, an act of intercession. Paul is standing in the gap between Onesimus and Philemon, pleading the cause of a man who could not effectively plead for himself. This act of intercession has its ultimate model in the intercession of Jesus Christ, who stands before the Father on behalf of all who believe. Christian intercession — whether in prayer or in practical advocacy — is one of the most powerful and Christlike ministries available to every believer.',
    lesson_conclusion: 'We are called to be intercessors — in prayer before the throne of God, and in practical advocacy before the powers of this world on behalf of those who cannot speak for themselves. The ministry of intercession is not passive waiting — it is active, costly, sacrificial engagement on behalf of another. When we intercede for others, we participate in the very ministry of Jesus, our Great High Priest, who lives forever to make intercession for us.',
    lesson_part: [
      {
        part_topic: 'Paul as Intercessor: A Model of Advocacy',
        part_para1: 'The entire letter to Philemon is an act of intercession. Paul is not writing about himself or about abstract theological principles. He is writing to advocate for another person — someone who is vulnerable, who has made serious mistakes, and who needs someone to speak on his behalf. This is the essence of Christian intercession: moving beyond concern for oneself and investing one\'s influence and energy in the cause of another.',
        part_para2: 'Paul\'s intercession for Onesimus is concrete and specific. He does not offer vague good wishes. He makes a specific request, offers a specific financial guarantee, and commits his personal reputation to the cause. He has put his skin in the game. This is a pattern of intercession that goes far beyond praying from a safe distance — it involves genuine personal investment and risk. True intercession always costs the intercessor something.',
      },
      {
        part_topic: 'Jesus: Our Great High Priest and Intercessor',
        part_para1: 'Behind Paul\'s intercession stands the ultimate model: Jesus Christ, who "ever liveth to make intercession for them" (Hebrews 7:25). Jesus did not merely pray for us from a distance. He entered our human situation, experienced our suffering, bore our sin, and now stands before the Father with the marks of His sacrifice as evidence of His perfect advocacy on our behalf. Our Great High Priest knows what it means to be human, to be tempted, to suffer, and to be rejected.',
        part_para2: 'Because Jesus intercedes for us, we can approach the throne of grace with confidence (Hebrews 4:16). And because we are the recipients of His intercession, we are called to extend the same ministry to others. The one who has been interceded for becomes an intercessor. The one who has been advocated for becomes an advocate. This is the perpetual rhythm of grace in the kingdom of God — receiving and giving, being lifted and lifting others.',
      },
      {
        part_topic: 'The Practice of Christian Intercession Today',
        part_para1: 'Intercession takes many forms in the contemporary church. It includes praying for the sick, the suffering, and the lost. It includes advocacy for justice on behalf of those who are oppressed. It includes practical support for those in need — standing with them, speaking for them, and using whatever resources and influence we possess in the service of their wellbeing. Every Christian is called to this ministry of standing in the gap.',
        part_para2: 'The church in Nigeria faces enormous opportunities for the ministry of intercession — for communities torn by conflict, for children who have no access to education or healthcare, for young people without hope or direction. The church that prays fervently and advocates practically for the vulnerable in its community will demonstrate the compassion of Christ in ways that draw people to the gospel. Intercession is not a retreat from social responsibility — it is its deepest form.',
      },
    ],
    questions: [
      'What does Paul\'s letter to Philemon teach us about the nature of genuine Christian intercession?',
      'How does Jesus\'s ongoing intercession for us motivate and model our own ministry of intercession?',
      'What is the relationship between prayer and practical advocacy in the Christian life?',
      'Who in your community most needs someone to intercede for them right now — in prayer or in practical action?',
      'How can your church become more effective as a community of intercessors for your neighbourhood and nation?',
    ],
    devotional_days: [
      { day: 'Day 1 — Monday',    scripture: 'Hebrews 7:23–27',    title: 'The Eternal Intercessor' },
      { day: 'Day 2 — Tuesday',   scripture: 'Romans 8:26–27',     title: 'The Spirit Intercedes' },
      { day: 'Day 3 — Wednesday', scripture: 'Exodus 32:9–14',     title: 'Moses Stands in the Gap' },
      { day: 'Day 4 — Thursday',  scripture: 'Isaiah 59:16',       title: 'When No One Intercedes' },
      { day: 'Day 5 — Friday',    scripture: 'Ezekiel 22:30',      title: 'The Intercessor Needed' },
      { day: 'Day 6 — Saturday',  scripture: '1 Timothy 2:1–4',    title: 'Intercessions for All Men' },
    ],
    sort_order: 8,
    topic_for_adults: 'Christian intercession is a ministry of love that reflects the heart of our Great High Priest.',
    topic_for_youth: 'Standing up for and praying for people who need someone on their side.',
    topic_for_intermediate: 'How praying for others and helping them is part of following Jesus.',
    topic_for_children: 'We can pray for our friends and family and Jesus prays for us too.',
  },

  {
    lesson_number: 9,
    unit_id: 'adult_unit_2',
    lesson_date: '29th November, 2026',
    title: 'The Courage to Do Right: Christian Ethics Under Pressure',
    topic: 'The Christian life demands moral courage — the willingness to do right even when it is costly.',
    quarter_theme: 'Demonstration of the Christian Life',
    suggested_hymns: 'MHB 480, MHB 395, MHB 539',
    devotional_reading: 'Daniel 3:13–18',
    memory_verse: 'But without thy mind would I do nothing; that thy benefit should not be as it were of necessity, but willingly.',
    memory_verse_passage: 'Philemon 1:14',
    lesson_background: 'The Christian life is not a life of comfort and ease — it is a life that regularly confronts us with difficult choices, situations where doing the right thing costs something significant. Philemon\'s situation is a case study in ethical courage. He is being asked to do something that goes against the grain of his culture, that could make him look weak in the eyes of his peers, and that requires him to surrender rights that he legally possessed. Doing the right thing was going to cost Philemon — and Paul knew it.',
    lesson_conclusion: 'The Christian life demands moral courage in every generation. The forms of courage required may differ — in one era it might be the courage to resist unjust laws, in another the courage to speak truth to corrupt power, in another the courage to be honest in business dealings or faithful in marriage when it is unpopular. But the call remains constant: "be strong in the Lord, and in the power of his might" (Ephesians 6:10). The world needs to see Christians who do not merely believe the right things but who have the courage to live them out in the most challenging circumstances.',
    lesson_part: [
      {
        part_topic: 'The Courage to Receive the Returning Sinner',
        part_para1: 'One of the most courageous things Philemon could do was to publicly receive Onesimus as a brother. In the ancient Roman world, a master who received a runaway slave back without punishment would be seen as weak, as undermining the entire social order, as inviting the contempt of his peers. The eyes of the community were upon him. Social pressure was enormous. To receive Onesimus as Paul requested was an act of radical moral courage in the face of all of these pressures.',
        part_para2: 'The church today faces similar pressures when it is called to receive and genuinely include people whom society has excluded — the addicted, the imprisoned, the morally compromised. The path of least resistance is to maintain a safe social distance. But the path of the gospel is the path of costly welcome. This requires the courage to care more about what God thinks than about what our peers, our community, or our culture will say.',
      },
      {
        part_topic: 'The Courage to Act Freely, Not Under Compulsion',
        part_para1: 'Paul specifically does not compel Philemon to act. He says, "without thy mind would I do nothing; that thy benefit should not be as it were of necessity, but willingly" (v.14). This is a profound insight into the nature of genuine Christian obedience. Obedience that is merely external, performed under compulsion or to avoid punishment, is not Christian character — it is mere compliance. God desires willing, joyful, freely chosen obedience that comes from a transformed heart.',
        part_para2: 'The courage Paul is asking for from Philemon is the courage to choose freely what is right, even though no one is forcing him. This is harder than obedience under compulsion. When someone forces you to do the right thing, you bear no moral credit for it. But when you choose freely to do the costly, counter-cultural, Christlike thing — when you absorb the cost of another\'s wrong without external pressure — you demonstrate that the gospel has truly taken root in your heart.',
      },
      {
        part_topic: 'Moral Courage in Contemporary Christian Life',
        part_para1: 'Every generation of Christians faces situations that demand moral courage: the courage to speak truth when lies are convenient, to maintain sexual integrity in a permissive culture, to be honest in business dealings when corruption is normalised, to stand against injustice even when the perpetrators are powerful. These situations test whether our faith is merely theoretical or whether it has produced the kind of character that can withstand pressure.',
        part_para2: 'The source of Christian moral courage is not willpower or self-discipline, though these are important. The deepest source is the knowledge that we stand before an audience of One — that ultimately it is God\'s assessment of our choices, not the world\'s, that determines the true value of what we do. Like the three Hebrew children facing Nebuchadnezzar\'s furnace, the Christian life at its best says: "our God is able to deliver us... but if not, be it known unto thee, O king, that we will not serve thy gods."',
      },
    ],
    questions: [
      'What specific forms of moral courage did Philemon need to exercise in this situation?',
      'Why does Paul make the point that he wants Philemon to act willingly and not under compulsion? What is the significance of this for Christian ethics?',
      'What situations in contemporary Nigerian society most demand moral courage from Christians today?',
      'How do you find strength and motivation to do the right thing when it is costly or unpopular?',
      'What is the difference between willpower and the moral courage that comes from a transformed heart?',
    ],
    devotional_days: [
      { day: 'Day 1 — Monday',    scripture: 'Philemon 1:14',       title: 'Willingly, Not By Force' },
      { day: 'Day 2 — Tuesday',   scripture: 'Daniel 3:13–18',      title: 'The Courage of Conviction' },
      { day: 'Day 3 — Wednesday', scripture: 'Acts 5:27–32',        title: 'Obeying God Rather Than Men' },
      { day: 'Day 4 — Thursday',  scripture: 'Esther 4:13–16',      title: 'For Such a Time as This' },
      { day: 'Day 5 — Friday',    scripture: 'Joshua 1:6–9',        title: 'Be Strong and Courageous' },
      { day: 'Day 6 — Saturday',  scripture: 'Ephesians 6:10–13',   title: 'Standing Firm in the Evil Day' },
    ],
    sort_order: 9,
    topic_for_adults: 'The Christian life demands moral courage — the willingness to do right even when it is costly.',
    topic_for_youth: 'Standing up for what is right even when it\'s hard or unpopular.',
    topic_for_intermediate: 'Doing the right thing even when friends or others make it difficult.',
    topic_for_children: 'Being brave and doing what is right even when it is hard.',
  },

  {
    lesson_number: 10,
    unit_id: 'adult_unit_3',
    lesson_date: '6th December, 2026',
    title: 'Christian Witness in the Workplace',
    topic: 'The Christian life must be demonstrated in how we work, lead, and relate to colleagues.',
    quarter_theme: 'Demonstration of the Christian Life',
    suggested_hymns: 'MHB 465, MHB 719, MHB 395',
    devotional_reading: 'Colossians 3:22–4:1',
    memory_verse: 'And whatsoever ye do, do it heartily, as to the Lord, and not unto men; knowing that of the Lord ye shall receive the reward of the inheritance: for ye serve the Lord Christ.',
    memory_verse_passage: 'Colossians 3:23–24',
    lesson_background: 'The letter to Philemon was written to a man who was both a church leader and a slave owner — a man whose Christian faith operated simultaneously in the religious and the economic spheres of life. The challenge for Philemon was to bring his Christian principles to bear on his economic relationships and practices. This is the perennial challenge for all believers: how to be genuinely Christian in the workplace, the marketplace, and the professional sphere where so much of life is lived.',
    lesson_conclusion: 'The workplace is not a secular zone that exists outside the scope of Christian discipleship — it is one of the primary arenas where the Christian life must be demonstrated. Every Christian professional, trader, artisan, farmer, and worker is called to bring the values of the kingdom of God to their daily work: integrity, excellence, fairness, compassion, and genuine service. When Christians demonstrate these qualities consistently in their professional lives, they become powerful witnesses to the transforming power of the gospel.',
    lesson_part: [
      {
        part_topic: 'Work as a Calling, Not Just a Career',
        part_para1: 'The Christian doctrine of vocation teaches that all legitimate work is a calling from God, an opportunity to serve both God and neighbour through our skills and efforts. The carpenter, the teacher, the nurse, the civil servant, the trader, and the pastor are all engaged in vocations that, when done with integrity and excellence for the glory of God, constitute genuine forms of worship and service. The sacred-secular divide that many Christians unconsciously maintain is a distortion of the biblical vision of work.',
        part_para2: 'Philemon\'s household was both an economic enterprise and a church. His faith was not confined to the hours when the congregation assembled for worship — it was supposed to permeate every transaction, every instruction to slaves, every business decision. The same is true for every Christian today. The way we treat our employees, the way we price our goods, the way we meet deadlines, the way we handle money that is not ours — all of these are expressions of (or contradictions to) our professed faith.',
      },
      {
        part_topic: 'The Christian Standard of Excellence',
        part_para1: '"Whatsoever ye do, do it heartily, as to the Lord, and not unto men" (Colossians 3:23). This is the Christian standard of excellence — not the minimum required to avoid punishment, not merely what is expected by the employer, but the maximum of which one is capable, done with wholehearted commitment because we are ultimately working for the Lord. The Christian worker is not defined by what the boss can see, but by what God sees — every moment, every task, every small decision.',
        part_para2: 'In a work culture that is often marked by mediocrity, corruption, and the bare minimum, the Christian who genuinely embraces this standard will stand out conspicuously. Excellence in Christian work is itself an evangelistic tool. When people ask why a person works so honestly, so diligently, so carefully, the answer provides an opportunity to speak about the God who sees all things and to whom all work is ultimately directed.',
      },
      {
        part_topic: 'Justice and Fairness in Christian Employment Practices',
        part_para1: 'The situation with Onesimus raises questions about the treatment of workers — a question as urgent today as it was in the first century. Paul\'s letter implicitly challenges Philemon\'s entire relationship with his slaves by introducing the revolutionary category of brotherhood. The same gospel that calls workers to diligent service calls employers to fair, just, and humane treatment of those who work for them.',
        part_para2: 'Nigerian businesses, government offices, and institutions are often plagued by exploitation, unfair wages, unsafe conditions, and disrespect for workers. The Christian employer who pays fair wages, treats workers with dignity, and maintains safe and honest working conditions is making a powerful statement about the kingdom of God. When the gospel transforms the workplace, it becomes a place where human dignity is honoured and where the values of the kingdom are visibly expressed.',
      },
    ],
    questions: [
      'How does the biblical concept of vocation challenge the sacred-secular divide that many Christians unconsciously maintain?',
      'What specific aspects of your current work or vocation are most challenging to live out as a Christian? Why?',
      'How does Colossians 3:23–24 transform the way we approach even the most mundane aspects of our daily work?',
      'What obligations does the Christian employer have toward those who work for them? How does this flow from the gospel?',
      'Describe a Christian you know who demonstrates the values of the kingdom in their workplace. What most impresses you about them?',
    ],
    devotional_days: [
      { day: 'Day 1 — Monday',    scripture: 'Colossians 3:22–4:1', title: 'Working for the Lord' },
      { day: 'Day 2 — Tuesday',   scripture: 'Proverbs 22:29',      title: 'Excellence in Work' },
      { day: 'Day 3 — Wednesday', scripture: 'Matthew 25:14–30',    title: 'The Parable of the Talents' },
      { day: 'Day 4 — Thursday',  scripture: 'Nehemiah 4:6',        title: 'A Mind to Work' },
      { day: 'Day 5 — Friday',    scripture: 'James 5:1–5',         title: 'Justice for Workers' },
      { day: 'Day 6 — Saturday',  scripture: '2 Thessalonians 3:6–12', title: 'Work Faithfully' },
    ],
    sort_order: 10,
    topic_for_adults: 'The Christian life must be demonstrated in how we work, lead, and relate to colleagues.',
    topic_for_youth: 'How to be a Christian student — honest, hardworking, and kind in school.',
    topic_for_intermediate: 'Being a good student and treating classmates well because of Jesus.',
    topic_for_children: 'Doing our chores and schoolwork well is a way of honouring God.',
  },

  {
    lesson_number: 11,
    unit_id: 'adult_unit_3',
    lesson_date: '13th December, 2026',
    title: 'Christian Marriage and Family Life',
    topic: 'The Christian home is a demonstration of the love and grace of God to the watching world.',
    quarter_theme: 'Demonstration of the Christian Life',
    suggested_hymns: 'MHB 721, MHB 467, MHB 480',
    devotional_reading: 'Ephesians 5:22–6:4',
    memory_verse: 'And thou, Apphia our beloved, and Archippus our fellowsoldier, and to the church in thy house.',
    memory_verse_passage: 'Philemon 1:2',
    lesson_background: 'The mention of Apphia in Philemon 1:2 is brief but significant. She is named alongside Philemon and Archippus as a central figure in the house church, most likely Philemon\'s wife. The fact that Paul addresses her directly suggests that she had a significant role in the household church and would be involved in the decision about Onesimus. The Christian home was not a private retreat from the world — it was the primary location for the embodiment and propagation of the gospel.',
    lesson_conclusion: 'The Christian home is one of the most powerful instruments of evangelism and discipleship in the world. When the watching world sees a Christian marriage characterised by genuine love, mutual respect, sacrificial service, and joyful commitment, it witnesses a demonstration of the gospel that no sermon can fully replicate. The challenge for every Christian couple and family is to make the home a place where the values of the kingdom are consistently embodied — a place of love, truth, grace, forgiveness, and genuine faith.',
    lesson_part: [
      {
        part_topic: 'The Christian Home as Kingdom Territory',
        part_para1: 'The phrase "the church in thy house" (v.2) encapsulates a profound truth about the nature of the Christian household. The home is not merely a private space for personal comfort and family life. It is kingdom territory — a place where the values and practices of the kingdom of God are to be expressed, modelled, and transmitted to the next generation. Every Christian household is called to be a little church — a community of worship, prayer, service, and mutual accountability.',
        part_para2: 'This vision of the home as church has profound implications for how Christian families structure their life together. Family worship, prayer together, discipling children in the ways of God, practising hospitality, discussing ethical decisions in the light of Scripture — all of these practices transform the home from a merely domestic space into a genuinely ecclesial space. The home church of Philemon was literally the early church. Our homes today can still be places where the church is most truly itself.',
      },
      {
        part_topic: 'Marriage as a Covenant and a Witness',
        part_para1: 'Christian marriage is not merely a social institution or a legal contract — it is a covenant, a sacred bond that reflects the relationship between Christ and His church (Ephesians 5:22–33). When a Christian couple lives out their marriage in a spirit of mutual love, respect, and service, they make the invisible relationship between Christ and the church visible to the watching world. Their marriage becomes a window through which others can glimpse the nature of divine love.',
        part_para2: 'This places an extraordinary weight of responsibility on Christian marriages — and an extraordinary dignity. Every act of genuine love between a husband and wife, every choice of forgiveness over bitterness, every instance of sacrificial service between spouses, is an act of proclamation. It says: this is what God\'s love looks like. This is what the gospel produces. When Christian marriages fail to embody these qualities, the testimony of the gospel is damaged. When they do embody them, the gospel is gloriously displayed.',
      },
      {
        part_topic: 'Raising Children in the Fear and Admonition of the Lord',
        part_para1: 'Archippus, named in verse 2 as "our fellowsoldier," was likely the son of Philemon and Apphia. His mention alongside his parents suggests that the entire family was involved in Christian ministry. This is the ideal of the Christian family — not merely a collection of individuals who share a roof, but a community of disciples where faith is transmitted, values are modelled, and each member is being formed by the grace of God.',
        part_para2: 'The responsibility of parents to nurture children in the faith is one of the most serious and sacred callings in Scripture. Deuteronomy 6:4–9 commands that the commandments of God be taught diligently to children — in the home, on the road, at bedtime, and at waking. In a generation where children are being formed primarily by screens, peers, and popular culture, the Christian home that is deliberate and intentional about spiritual formation is engaged in one of the most countercultural and important ministries in the world.',
      },
    ],
    questions: [
      'What does it mean for your home to be "the church in your house"? What would need to change to make this a reality?',
      'How does the covenant nature of Christian marriage create both a responsibility and an opportunity for witness?',
      'What are the most significant challenges facing Christian marriages and families in Nigeria today?',
      'What practical disciplines can families adopt to ensure that the home is a place of genuine spiritual formation?',
      'How can the church as a community better support Christian marriages and families, especially those that are struggling?',
    ],
    devotional_days: [
      { day: 'Day 1 — Monday',    scripture: 'Ephesians 5:22–33',   title: 'The Marriage Covenant' },
      { day: 'Day 2 — Tuesday',   scripture: 'Ephesians 6:1–4',     title: 'Parenting in the Lord' },
      { day: 'Day 3 — Wednesday', scripture: 'Deuteronomy 6:4–9',   title: 'Teaching the Next Generation' },
      { day: 'Day 4 — Thursday',  scripture: 'Proverbs 22:6',       title: 'Train Up a Child' },
      { day: 'Day 5 — Friday',    scripture: 'Psalm 128:1–4',       title: 'The Blessed Family' },
      { day: 'Day 6 — Saturday',  scripture: 'Joshua 24:15',        title: 'As for Me and My House' },
    ],
    sort_order: 11,
    topic_for_adults: 'The Christian home is a demonstration of the love and grace of God to the watching world.',
    topic_for_youth: 'How to honour your parents and contribute positively to your family.',
    topic_for_intermediate: 'Being a good family member means loving and helping each other every day.',
    topic_for_children: 'God wants our families to love each other and to love Him together.',
  },

  {
    lesson_number: 12,
    unit_id: 'adult_unit_3',
    lesson_date: '20th December, 2026',
    title: 'Christian Community and Social Responsibility',
    topic: 'Christian love overflows the boundaries of the church into engagement with the wider society.',
    quarter_theme: 'Demonstration of the Christian Life',
    suggested_hymns: 'MHB 395, MHB 480, MHB 503',
    devotional_reading: 'Luke 10:25–37',
    memory_verse: 'Let your moderation be known unto all men. The Lord is at hand.',
    memory_verse_passage: 'Philippians 4:5',
    lesson_background: 'The gospel of Jesus Christ is both personal and social in its implications. While it begins with the transformation of the individual heart, it does not end there. The transformed heart produces a transformed life, and a transformed life produces a transformative engagement with the world. The early Christians were known not only for their worship but for their care for the poor, the sick, the widow, and the orphan. They turned the Roman world upside down not primarily through political power but through the visible love of the kingdom.',
    lesson_conclusion: 'The Christian church exists in the world for the world — to serve as salt and light in every community and culture it touches. This is not a peripheral mission but the very nature of what it means to be the body of Christ. When the church retreats from social engagement, focusing only on private piety and internal church programs, it fails to embody the full scope of the gospel. True Christian discipleship always produces people who are engaged with the real needs of the real world, bringing the love and justice of the kingdom to bear on every situation they encounter.',
    lesson_part: [
      {
        part_topic: 'The Church\'s Social Calling',
        part_para1: 'The early church was known for its radical social practice. Justin Martyr, writing in the second century, described a community that cared for orphans, widows, the sick, prisoners, and the poor — and this care attracted the admiration and curiosity of the watching world. The church was not merely a spiritual club for those who had their lives together — it was a community that went into the darkest corners of human need and brought the light of the gospel.',
        part_para2: 'The same calling falls on the church today. In communities marked by poverty, disease, illiteracy, and injustice, the church has both the motivation (the love of Christ) and the message (the gospel of the kingdom) to make a genuine difference. This is not "social gospel" at the expense of personal salvation — it is the full gospel that addresses the whole person in every dimension of their need. The church that feeds the hungry and also leads them to Christ is bearing the most complete witness to the kingdom.',
      },
      {
        part_topic: 'Christians as Citizens: Salt and Light',
        part_para1: '"Ye are the salt of the earth... ye are the light of the world" (Matthew 5:13–14). These metaphors are inherently social. Salt works by penetrating and permeating the substance it is applied to. Light works by illuminating the darkness around it. Christians are not called to create a separate, parallel society that has no contact with the fallen world. They are called to penetrate society as salt and illuminate it as light — to be present, engaged, and transformative wherever they are placed.',
        part_para2: 'This means that Christian engagement with the political, economic, and social structures of our society is not optional — it is a dimension of our discipleship. The Christian who refuses to participate in civic life, who regards politics as inherently dirty and therefore abstains entirely, has abdicated a significant dimension of their kingdom calling. We are called to work for the welfare of the city in which God has placed us (Jeremiah 29:7), to pray for those in authority (1 Timothy 2:1–2), and to be a voice for justice and truth in every sphere of public life.',
      },
      {
        part_topic: 'Practical Love in Community',
        part_para1: 'The parable of the Good Samaritan (Luke 10:25–37) is the definitive New Testament statement on Christian social responsibility. The Samaritan did not merely feel compassion for the wounded man — he stopped, he helped, he paid, he returned to check. His love was practical, personal, and costly. Jesus ends the parable not with an abstract principle but with a direct command: "Go, and do thou likewise." The test of Christian love is not what we feel but what we do.',
        part_para2: 'In the Nigerian context, opportunities for this kind of practical neighbour-love are abundant. The street child, the refugee, the widow who cannot pay medical bills, the community that lacks clean water, the school that needs books — all of these present the church with opportunities to demonstrate the love of Christ in concrete, tangible ways. The church that seizes these opportunities, not for public relations but from genuine Christlike compassion, will find that its social ministry opens doors for the proclamation of the gospel.',
      },
    ],
    questions: [
      'What does "salt and light" mean for a Christian\'s engagement with the social, political, and economic life of their community?',
      'Is there a distinction between the "social gospel" and the full gospel? How does one balance proclamation and social action?',
      'What specific social challenges in your community most urgently need the church\'s engagement?',
      'How does the parable of the Good Samaritan challenge or expand your understanding of who your "neighbour" is?',
      'What is one concrete step your church could take in the next month to demonstrate the love of Christ to the wider community?',
    ],
    devotional_days: [
      { day: 'Day 1 — Monday',    scripture: 'Matthew 5:13–16',    title: 'Salt and Light' },
      { day: 'Day 2 — Tuesday',   scripture: 'Luke 10:25–37',      title: 'Who Is My Neighbour?' },
      { day: 'Day 3 — Wednesday', scripture: 'Jeremiah 29:4–7',    title: 'Seek the Peace of the City' },
      { day: 'Day 4 — Thursday',  scripture: 'Micah 6:8',          title: 'Justice, Mercy, and Humility' },
      { day: 'Day 5 — Friday',    scripture: 'Isaiah 58:6–7',      title: 'The Fast God Chooses' },
      { day: 'Day 6 — Saturday',  scripture: 'James 2:14–17',      title: 'Faith Without Works Is Dead' },
    ],
    sort_order: 12,
    topic_for_adults: 'Christian love overflows the boundaries of the church into engagement with the wider society.',
    topic_for_youth: 'How Christians can make a difference in their school, community, and nation.',
    topic_for_intermediate: 'Being kind and helpful in our neighbourhood shows everyone God loves them.',
    topic_for_children: 'We can show God\'s love by helping people in our community.',
  },

  {
    lesson_number: 13,
    unit_id: 'adult_unit_3',
    lesson_date: '27th December, 2026',
    title: 'Demonstrating the Christian Life: A Call to Action',
    topic: 'Every believer is called to embody the gospel in every area of life, leaving a legacy of love.',
    quarter_theme: 'Demonstration of the Christian Life',
    suggested_hymns: 'MHB 762, MHB 395, MHB 528',
    devotional_reading: 'Titus 2:11–14',
    memory_verse: 'For the grace of God that bringeth salvation hath appeared to all men, teaching us that, denying ungodliness and worldly lusts, we should live soberly, righteously, and godly, in this present world.',
    memory_verse_passage: 'Titus 2:11–12',
    lesson_background: 'The final lesson of this quarter brings us full circle. We began with the greeting of a prisoner and a slave owner — two men whose lives were being transformed by the same gospel. We end with a call to every believer to embrace the full scope of that transformation. The letter to Philemon, brief as it is, contains within it the seeds of a complete theology of the Christian life: conversion, fellowship, forgiveness, reconciliation, intercession, hospitality, moral courage, and social witness. This quarter we have examined each of these seeds. Now the question is: what will each of us do with what we have received?',
    lesson_conclusion: 'The Christian life is not an achievement to be attained but a grace to be received and demonstrated. Everything we have studied this quarter — forgiveness, brotherhood, reconciliation, hospitality, moral courage, social responsibility — is not a set of duties we must perform in order to earn God\'s favour. It is the natural outflow of a life that has truly encountered the grace of God in Jesus Christ. As we close this quarter, let every believer commit afresh to demonstrating the grace of God in every area of life — at home, at work, in the church, and in the world — to the glory of God.',
    lesson_part: [
      {
        part_topic: 'Grace as the Foundation of Christian Living',
        part_para1: '"The grace of God that bringeth salvation hath appeared to all men, teaching us that, denying ungodliness and worldly lusts, we should live soberly, righteously, and godly, in this present world" (Titus 2:11–12). The word "teaching" here is extraordinary. Grace is not merely a transaction that secures our forgiveness — it is a teacher that trains us in a new way of living. Grace teaches us to say no to sin, to live with moderation, to pursue righteousness, and to inhabit this present age with the values of the age to come.',
        part_para2: 'This means that the Christian life is not sustained by human willpower or moral effort — it is sustained by a continual encounter with and appropriation of divine grace. We do not live well in order to earn more grace. We live well because we have received grace freely. The gospel frees us from the treadmill of performance-based religion and calls us into a life of grateful, Spirit-empowered response to the love that God has lavished upon us in Christ.',
      },
      {
        part_topic: 'A Life of Legacy: The Call to Finish Well',
        part_para1: 'Paul wrote his letter to Philemon from prison, facing possible execution. Yet the letter breathes hope, love, and expectation. He believes he will be released (v.22). He plans to visit. He anticipates the joy of seeing the restoration he has set in motion. Paul\'s example invites us to reflect on the kind of legacy we are building — not merely what we will leave behind in terms of wealth or reputation, but what we will have invested in the lives of people around us through love, prayer, and faithful witness.',
        part_para2: 'The greatest legacy a Christian can leave is not a building or an institution — it is transformed lives. It is Onesimuses whose lives have been turned around by our willingness to invest in them. It is Philemons who have been challenged and stretched into a greater expression of the love of Christ. It is communities that are different because we passed through them. This is the fruit that Jesus said "should remain" (John 15:16) — not our achievements, but our investments in people made in the name of Christ.',
      },
      {
        part_topic: 'The Final Word: Demonstrating Grace in All of Life',
        part_para1: 'The letter to Philemon ends as it began: "The grace of our Lord Jesus Christ be with your spirit" (v.25). Grace is the first word and the last word. Grace is the foundation and the capstone. Grace is what makes it possible for Philemon to forgive. Grace is what makes Onesimus into a useful servant. Grace is what enables Paul to write from prison with hope and joy. Grace is the power that transforms the impossible — the reunion of master and slave as brothers — into a visible reality.',
        part_para2: 'As we conclude this quarter, the invitation is to let the grace of the Lord Jesus Christ permeate every dimension of our lives. Not just our Sunday worship, but our Monday morning decisions. Not just our prayers, but our business practices. Not just our theological convictions, but our family relationships. Not just our sermons, but our neighbourly acts. The demonstration of the Christian life is not a single grand gesture — it is the accumulated weight of a thousand small, faithful, grace-empowered choices to live as citizens of the kingdom of God in the midst of this present world.',
      },
    ],
    questions: [
      'How does the grace of God function as a teacher in the Christian life, according to Titus 2:11–12?',
      'What kind of legacy are you building through your investment in the lives of people around you?',
      'Looking back over this quarter, which lesson has most challenged or transformed your understanding of the Christian life?',
      'What one specific change in your life will you make as a result of this quarter\'s study?',
      'How can your local church community become a more visible demonstration of the Christian life to the world around it?',
    ],
    devotional_days: [
      { day: 'Day 1 — Monday',    scripture: 'Titus 2:11–14',      title: 'Grace Our Teacher' },
      { day: 'Day 2 — Tuesday',   scripture: 'Philemon 1:25',      title: 'Grace: The Final Word' },
      { day: 'Day 3 — Wednesday', scripture: '2 Timothy 4:6–8',    title: 'Finishing Well' },
      { day: 'Day 4 — Thursday',  scripture: 'John 15:8, 16',      title: 'Fruit That Remains' },
      { day: 'Day 5 — Friday',    scripture: 'Revelation 22:20–21', title: 'Come, Lord Jesus' },
      { day: 'Day 6 — Saturday',  scripture: '1 Corinthians 15:58', title: 'Your Labour Is Not in Vain' },
    ],
    sort_order: 13,
    topic_for_adults: 'Every believer is called to embody the gospel in every area of life, leaving a legacy of love.',
    topic_for_youth: 'Living all of your life for Christ — at school, at home, and in the future.',
    topic_for_intermediate: 'Following Jesus every day and in every part of our lives.',
    topic_for_children: 'Loving Jesus every day — at home, at school, and everywhere we go.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// YORUBA TRANSLATIONS — Memory verses + key titles
// ─────────────────────────────────────────────────────────────────────────────
const YO_TRANSLATIONS = {
  1:  { title: 'Ìdèpọ̀ Tí Ó Kọjá Àwọn Ìdènà Àwùjọ', memory_verse: 'Mo dúpẹ́ lọ́wọ́ Ọlọ́run mi nígbà gbogbo, tí mo ń mẹ́nu bà ọ nínú àwọn àdúrà mi, tí mo gbọ́ nípa ifẹ́ rẹ àti ìgbàgbọ́ rẹ', topic: 'Ìdékòjọ Kristẹni ń so àwọn ènìyàn pọ̀ láti gbogbo ipò ìgbésí ayé nínú Kristi Jesu.' },
  2:  { title: 'Ìfẹ́ Tí Ó Ń Rọ: Ọ̀nà Tó Dára Jù Láti Darí', memory_verse: 'Nítorí náà, bí ó tilẹ̀ jẹ́ pé mo ní ẹ̀tọ́ láti pa á láṣẹ nínú Kristi, àmọ́ fún ifẹ́, mo kàn máa bẹ ọ lẹ́bẹ̀', topic: 'Ìdarí Kristẹni ń ṣiṣẹ́ nípasẹ̀ ifẹ́ àti àwọn ìgbàníyànjú, kì í ṣe ìpayà.' },
  3:  { title: 'Tí A Ti Yípadà Nípasẹ̀ Ore-ọ̀fẹ́: Ìtàn Onesimus', memory_verse: 'Ẹni tí ó wà ní àkókò tẹ̀lẹ̀ kò wúlò fún ọ, ṣùgbọ́n báyìí wọ́n wúlò fún ọ àti fún mi', topic: 'Ore-ọ̀fẹ́ Ọlọ́run ń yí ẹni tó ṣẹ̀ jù pọ̀ padà di òjíṣẹ́ tó wúlò nínú Kristi.' },
  4:  { title: 'Ìdánimọ̀ Kristẹni: Kò Sí Mọ́ Gẹ́gẹ́ Bí Ẹrú', memory_verse: 'Kì í ṣe báyìí mọ́ bí ẹrú, ṣùgbọ́n ju ẹrú lọ, arákùnrin olufẹ́', topic: 'Nínú Kristi, àwọn ẹ̀ka àwùjọ àti òfin ni a ti yọrù sí ìdánimọ̀ gíga bí arákùnrin àti ẹ̀gbọ́n.' },
  5:  { title: 'Ìdarí Àṣìṣe: Ọkàn Ìdékòjọ Kristẹni', memory_verse: 'Tí ó bá ṣe àṣìṣe sí ọ, tàbí bí ó bá jẹ ọ ohun, fi ẹ̀yà fún mi', topic: 'Ìdarí àṣìṣe Kristẹni kì í ṣe àìlera ṣùgbọ́n agbára tó wúlò jù lọ nínú àwọn àjọṣepọ̀ ènìyàn.' },
  6:  { title: 'Ìṣọkan: Mímú Àwọn Àjọṣepọ̀ Tó Fọ́ Padà Sọ́kan', memory_verse: 'Bẹ́ẹ̀ ni, arákùnrin, jẹ́ kí n ní inú dídùn rẹ nínú Olúwa', topic: 'Ìhìn-rere ń fipá mú àwọn Kristẹni láti lepa ìṣọkan bí àfihàn ore-ọ̀fẹ́ Ọlọ́run.' },
  7:  { title: 'Àṣà Kristẹni: Ṣíṣí Ọkàn àti Ilé', memory_verse: 'Ti mo ní ìdárójú nínú ìgbọràn rẹ, mo kọ sí ọ, mọ̀ pé iwọ yóò tún ṣe ju ohun tí mo ní sọ', topic: 'Àṣà Kristẹni jẹ́ àfihàn gidi ti ifẹ́ Kristẹni tí ó ń kọ́ àwùjọ ìgbàgbọ́.' },
  8:  { title: 'Àdúrà Àríwísí: Dúró Nínú Àwọn Àfo Fún Àwọn Ẹlòmíràn', memory_verse: 'Nítorí náà, ó ní agbára láti gbà àwọn tí wọ́n bọ̀ sọ́dọ̀ Ọlọ́run nípasẹ̀ rẹ̀ tó pé, tí ó sì ń gbé tí ó ń gbàdúrà fún wọn', topic: 'Àdúrà àríwísí Kristẹni jẹ́ iṣẹ́ ifẹ́ tí ó ń ṣe àfihàn ọkàn Ólúwa Àlùfáà Wa Ńlá.' },
  9:  { title: 'Ìgboyà Láti Ṣe Ohun Tó Tọ́: Ìṣẹ̀dánwò Kristẹni Lábẹ́ Ìpayà', memory_verse: 'Àmọ́ láìsí èrò rẹ, mi ò ní ṣe ohun kan; kí ire rẹ má ṣe jẹ́ gẹ́gẹ́ bí ẹ̀rí, ṣùgbọ́n ní ìfẹ́', topic: 'Ìgbésí ayé Kristẹni nilo ìgboyà àṣà — ìfẹ́ láti ṣe ohun tó tọ́ bí ó tilẹ̀ jẹ́ pé ó ní iye.' },
  10: { title: 'Ẹ̀rí Kristẹni Ní Ibi Iṣẹ́', memory_verse: 'Gbogbo ohun tí ẹ bá ṣe, ṣe é pẹ̀lú gbogbo ọkàn rẹ, gẹ́gẹ́ bí fún Olúwa, kì í ṣe fún ènìyàn', topic: 'Ìgbésí ayé Kristẹni gbọdọ̀ jẹ́ àfihàn ní bí a ti ṣiṣẹ́, darí, àti ṣe àjọṣepọ̀ pẹ̀lú àwọn ẹlẹgbẹ́.' },
  11: { title: 'Ìgbéyàwó àti Ìgbésí Ayé Ìdílé Kristẹni', memory_verse: 'Àti Àpphia arẹ́wà wa, àti Archippus ẹ̀gbẹ́ ológun wa, àti ìjọ tó wà nínú ilé rẹ', topic: 'Ilé Kristẹni jẹ́ àfihàn ifẹ́ àti ore-ọ̀fẹ́ Ọlọ́run fún agbáyé tó ń wò.' },
  12: { title: 'Àwùjọ Kristẹni àti Ojúṣe Àwùjọ', memory_verse: 'Jẹ́ kí ìtẹ̀lọrun rẹ mọ̀ fún gbogbo ènìyàn. Olúwa wà nítòsí.', topic: 'Ifẹ́ Kristẹni ń ṣàn jáde àwọn ààlà ìjọ sínú ìkópa pẹ̀lú àwùjọ tó gbòòrò.' },
  13: { title: 'Ìfihàn Ìgbésí Ayé Kristẹni: Ìpè Sí Ìgbésẹ̀', memory_verse: 'Nítorí ore-ọ̀fẹ́ Ọlọ́run tí ó mú ìgbàlà wá ti hàn fún gbogbo ènìyàn, ó ń kọ́ wa', topic: 'Gbogbo olùgbàgbọ́ ni a pe láti ṣe àwòrán ìhìn-rere ní gbogbo agbègbè ìgbésí ayé.' },
};

// ─────────────────────────────────────────────────────────────────────────────
// IGBO TRANSLATIONS — Memory verses + key titles
// ─────────────────────────────────────────────────────────────────────────────
const IG_TRANSLATIONS = {
  1:  { title: 'Njikọ Gafere Ihe Ọchịchọ Ọha', memory_verse: 'Ọ dị mma m ịtọ Chukwu m daa ekele n\'oge niile, m na-achọpụta gị na prayers m, nụ ihe gbasara ịhụnanya gị na okwukwe', topic: 'Mmekọahụ nke Onye Kraịst na-ejikọ ndị sitere n\'ọtụtụ ụzọ ndụ n\'otu n\'ime Kraịst Jizọs.' },
  2:  { title: 'Arịọ Nke Ịhụnanya: Ụzọ Dị Mma Iji Duzie', memory_verse: 'Yabụ ọ bụ ezie na enwere m ike ịnye iwu n\'ime Kraịst, mana n\'ihi ịhụnanya, kama a na-arịọ gị', topic: 'Ọchịchọ nke Onye Kraịst na-arụ ọrụ site n\'ịhụnanya na nkwụnye, ọ bụghị mgbochi.' },
  3:  { title: 'Mgbanwe Site n\'Eziokwu: Akụkọ Ihe Mere Onesimus', memory_verse: 'Onye n\'oge gara aga enweghị uru nye gị, mana ugbu a bara uru nye gị na nye m', topic: 'Obi ebere Chukwu na-agbanwe onye ọ bụla ọjọọ kachasị ọjọọ ka ọ bụrụ onye ozi bara uru n\'ime Kraịst.' },
  4:  { title: 'Njirimara Onye Kraịst: Ọ Bụghị Ohu Ọzọ', memory_verse: 'Ugbu a ọ bụghị ka ohu, kama karịa ohu, nwanna m hụrụ n\'anya', topic: 'N\'ime Kraịst, ụdị obodo na iwu na-agafee n\'njirimara dị elu dị ka ụmụnna na ụmụnne.' },
  5:  { title: 'Igwe Mmehie: Obi Nke Obodo Onye Kraịst', memory_verse: 'Ọ bụrụ na o mere gị ihe ọjọọ, ma ọ bụ na ọ ji gị ihe, dee ya n\'aka m', topic: 'Igwe mmehie nke Onye Kraịst abụghị adịghị ike kama ọ bụ ike kacha ike n\'mmekọahụ ụmụ mmadụ.' },
  6:  { title: 'Ntụghari: Iweghachi Mmekọahụ Gbajiri Agbajiri', memory_verse: 'Ee, nwanna, ọ gaara m ọṅụ site n\'gị n\'Onyenwe anyị', topic: 'Ọ bụ ozi ọma na-eme ka ndị Kraịst chọọ ntụghari dị ka ngosipụta obi ebere Chukwu.' },
  7:  { title: 'Ọ Bụ Onye Ọbịa: Imeghe Obi na Ụlọ', memory_verse: 'N\'inwe ntụkwasị obi n\'ịdị ná ntụ gị, edere m gi, mara na ị ga-eme ihe karịa naanị ihe m kwuwara', topic: 'Ịnabata ndị ọbịa bụ ngosipụta gị nke ịhụnanya Onye Kraịst na-ewu obodo nke okwukwe.' },
  8:  { title: 'Arịọ: Ịkwụ N\'ọnọdụ Ọ Dị Mma Maka Ndị Ọzọ', memory_verse: 'Nke mere ọ nwere ike ịzọpụta ha nke ọma nke biara Chukwu site n\'ya, dị ala ọ na-anọ n\'ndụ ịrịọ arịọ maka ha', topic: 'Ịrịọ arịọ Onye Kraịst bụ ọrụ ịhụnanya na-egosi obi Isi Ọkwa Anyị Nke Ọ Bụla.' },
  9:  { title: 'Nka Iji Me Ihe Ziri Ezi: Ihe Ọmụmụ Onye Kraịst N\'okpuru Nchegbu', memory_verse: 'Mana n\'ahụghị uche gị, aga m ghị eme ihe ọ bụla; ka ọha gị ghara ịbụ dị ka ọrụ, kama n\'ọnọdụ ọkwụkwe', topic: 'Ndụ Onye Kraịst chọrọ nka ọdịnaya — ịfẹ iji me ihe ziri ezi ọbụna mgbe ọ ka uru.' },
  10: { title: 'Ọ Bụ Onye Kraịst N\'ọrụ', memory_verse: 'Ihe ọ bụla ị na-eme, mee ya n\'ike, dị ka Onyenwe, ọ bụghị ka ndị mmadụ', topic: 'Ndụ Onye Kraịst kwesịrị igosipụta otu anyị si arụ ọrụ, duzie, na mmekọahụ na ndị ọrụ.' },
  11: { title: 'Alụmdi na Ndụ Ezinaụlọ Onye Kraịst', memory_verse: 'Na Apphia nwa nwanyị anyị hụrụ n\'anya, na Archippus onye agha anyị, na Chụọchị nke dị n\'ụlọ gị', topic: 'Ụlọ Onye Kraịst bụ ngosipụta ịhụnanya na obi ebere Chukwu nye ụwa na-ele anya.' },
  12: { title: 'Obodo Onye Kraịst na Ọrụ Obodo', memory_verse: 'Ka ndị mmadụ niile mara nleghara anya gị. Onyenwe nọ nso.', topic: 'Ịhụnanya Onye Kraịst na-agbapụ oke nke chọọchị n\'ịsonye na ọha obodo.' },
  13: { title: 'Igosi Ndụ Onye Kraịst: Nkpọsa Ịrụ Ọrụ', memory_verse: 'N\'ihi na obi ebere Chukwu wetara nzọpụta pụtara ìhè n\'ihe ọ bụla mmadụ, na-ọzụzụ anyị', topic: 'Onye okwukwe ọ bụla anywanụrụ ọrụ iji boro ozi ọma n\'akụkụ niile nke ndụ.' },
};

// ─────────────────────────────────────────────────────────────────────────────
// HAUSA TRANSLATIONS — Memory verses + key titles
// ─────────────────────────────────────────────────────────────────────────────
const HA_TRANSLATIONS = {
  1:  { title: `Ƙungiya Da Ta Wuce Shingayen Jama'a`, memory_verse: `Ina godiya ga Allahna kullum, ina ambaton ka a addu'o'ina, ina jin labarin ƙauna da bangaskiyarka`, topic: `Ƙungiyar Kirista tana haɗa kai mutane daga dukkan yanayin rayuwa cikin Yesu Almasihu.` },
  2:  { title: `Kiran Ƙauna: Hanyar Jagoranci Da Ta Fi Kyau`, memory_verse: `Saboda haka, ko da yake ina da ikon yin umarni a cikin Almasihu, amma saboda ƙauna, ina roƙonka`, topic: `Jagorancin Kirista yana aiki ta hanyar ƙauna da shawo kan hankali, ba ta hanyar tilastawa.` },
  3:  { title: `Canjuwa Ta Alheri: Labarin Onesimus`, memory_verse: `Wanda a da bai amfane ka ba, amma yanzu ya amfane kai da ni`, topic: `Alherin Allah na canza mafi muni mai zunubi zuwa ga mai amfani da hidima ga Almasihu.` },
  4:  { title: `Shaida ta Kirista: Ba Bawa Kuma Ba`, memory_verse: `Ba ƙara bawa ba, amma sama da bawa, dan'uwa mabiyaci`, topic: `A cikin Almasihu, ƙungiyoyin zamantakewa da na doka sun wuce zuwa ga matsayi mafi ɗaukaka na dan'uwa da ƙanwa.` },
  5:  { title: `Gafara: Zuciyar Al'ummar Kirista`, memory_verse: `Idan ya yi maka laifi, ko kuma ya kaine da wani abu, sa shi a asusuna`, topic: `Gafara ta Kirista ba raunana ba ce amma ita ce mafi ƙarfin iko a cikin dangantakar dan adam.` },
  6:  { title: `Sulhu: Maido da Dangantaka Wadda Ta Ɓace`, memory_verse: `E, dan'uwa, bari ni sami farin cikin ku cikin Ubangiji`, topic: `Bisharar Yesu Almasihu tana tura Kiristoci su nemi sulhu a matsayin nuni na alherin Allah.` },
  7:  { title: `Karimci na Kirista: Buɗe Zukata da Gidaje`, memory_verse: `Da na tabbata da biyayyarka, na rubuta maka, ina sanin cewa za ka yi sama da abin da na faɗa`, topic: `Karimci wata alama ce ta gaske ta ƙaunar Kirista da ke gina al'ummar imani.` },
  8:  { title: `Addu'a ta Roƙo: Tsayawa a Raami don Wasu`, memory_verse: `Saboda haka yana iya ceton waɗanda suka zo wurin Allah ta barinsa cikakke, ya kashe yana roƙon masu imani`, topic: `Addu'ar roƙo ta Kirista hidima ce ta ƙauna da ke nuna zuciyar Babban Firistanmu.` },
  9:  { title: `Ƙarfin Gwiwa don Yin Daidai: Ɗabi'ar Kirista Ƙarƙashin Matsin Lamba`, memory_verse: `Amma ba tare da ra'ayinka na za su yi komai ba; don fa'idarka ta kasance ba kamar tilas ba, amma da son rai`, topic: `Rayuwar Kirista tana buƙatar ƙarfin gwiwa na ɗabi'a — son yin daidai ko da yana da tsada.` },
  10: { title: `Shaida ta Kirista a Wurin Aiki`, memory_verse: `Kuma komai da kuka yi, kuyi shi daga zuciya, kamar wa Ubangiji, ba wa mutane ba`, topic: `Rayuwar Kirista dole ne ta nuna ta hanyar yadda muke aiki, jagoranci, da mu'amala da abokan aiki.` },
  11: { title: `Aurenta da Rayuwar Iyali ta Kirista`, memory_verse: `Da Apphia 'yar'uwanmu da ƙaunata, da Archippus soja abokinmu, da cocin da ke gidanka`, topic: `Gidan Kirista nuni ne na ƙaunar Allah da alherinSa ga duniya da ke kallo.` },
  12: { title: `Al'ummar Kirista da Alhakin Zamantakewa`, memory_verse: `Bari dattakcinku ya zama sananne ga dukan mutane. Ubangiji yana kusa.`, topic: `Ƙaunar Kirista tana zuwa daga iyakokin cocin zuwa cikin shiga da al'umman kusa.` },
  13: { title: `Nuna Rayuwar Kirista: Kiran Aiki`, memory_verse: `Gama alherin Allah wanda ya kawo ceto ya bayyana ga dukan mutane, yana koyar da mu`, topic: `Kowace mai imani an kira shi/ita su nuna Bishara a kowane fanni na rayuwa.` },
};

// ─────────────────────────────────────────────────────────────────────────────
// HYMNS — 20 essential GOFAMINT hymns
// ─────────────────────────────────────────────────────────────────────────────
const HYMNS = [
  {
    number: 290, title: 'Amazing Grace',
    author: 'John Newton (1779)',
    chorus: null,
    verses: [
      { number: 1, text: 'Amazing grace! How sweet the sound that saved a wretch like me! I once was lost, but now am found, was blind, but now I see.' },
      { number: 2, text: '\'Twas grace that taught my heart to fear, and grace my fears relieved; How precious did that grace appear the hour I first believed.' },
      { number: 3, text: 'Through many dangers, toils and snares, I have already come; \'Tis grace hath brought me safe thus far, and grace will lead me home.' },
      { number: 4, text: 'When we\'ve been there ten thousand years, bright shining as the sun, We\'ve no less days to sing God\'s praise than when we first begun.' },
    ],
  },
  {
    number: 395, title: 'Take My Life and Let It Be',
    author: 'Frances Ridley Havergal (1874)',
    chorus: null,
    verses: [
      { number: 1, text: 'Take my life, and let it be consecrated, Lord, to Thee; Take my moments and my days, let them flow in ceaseless praise.' },
      { number: 2, text: 'Take my hands, and let them move at the impulse of Thy love; Take my feet, and let them be swift and beautiful for Thee.' },
      { number: 3, text: 'Take my voice, and let me sing always, only, for my King; Take my lips, and let them be filled with messages from Thee.' },
      { number: 4, text: 'Take my love; my Lord, I pour at Thy feet its treasure-store; Take myself, and I will be ever, only, all for Thee.' },
    ],
  },
  {
    number: 416, title: 'O Love That Wilt Not Let Me Go',
    author: 'George Matheson (1882)',
    chorus: null,
    verses: [
      { number: 1, text: 'O Love that wilt not let me go, I rest my weary soul in Thee; I give Thee back the life I owe, that in Thine ocean depths its flow may richer, fuller be.' },
      { number: 2, text: 'O Light that followest all my way, I yield my flickering torch to Thee; My heart restores its borrowed ray, that in Thy sunshine\'s blaze its day may brighter, fairer be.' },
      { number: 3, text: 'O Joy that seekest me through pain, I cannot close my heart to Thee; I trace the rainbow through the rain, and feel the promise is not vain that morn shall tearless be.' },
      { number: 4, text: 'O Cross that liftest up my head, I dare not ask to fly from Thee; I lay in dust life\'s glory dead, and from the ground there blossoms red life that shall endless be.' },
    ],
  },
  {
    number: 427, title: 'What A Friend We Have in Jesus',
    author: 'Joseph Scriven (1855)',
    chorus: null,
    verses: [
      { number: 1, text: 'What a friend we have in Jesus, all our sins and griefs to bear! What a privilege to carry everything to God in prayer! O what peace we often forfeit, O what needless pain we bear, all because we do not carry everything to God in prayer.' },
      { number: 2, text: 'Have we trials and temptations? Is there trouble anywhere? We should never be discouraged: take it to the Lord in prayer. Can we find a friend so faithful who will all our sorrows share? Jesus knows our every weakness; take it to the Lord in prayer.' },
      { number: 3, text: 'Are we weak and heavy laden, cumbered with a load of care? Precious Saviour, still our refuge — take it to the Lord in prayer. Do thy friends despise, forsake thee? Take it to the Lord in prayer; in His arms He\'ll take and shield thee, thou wilt find a solace there.' },
    ],
  },
  {
    number: 441, title: 'Rock of Ages',
    author: 'Augustus Toplady (1775)',
    chorus: null,
    verses: [
      { number: 1, text: 'Rock of Ages, cleft for me, let me hide myself in Thee; let the water and the blood, from Thy riven side which flowed, be of sin the double cure, cleanse me from its guilt and power.' },
      { number: 2, text: 'Not the labours of my hands can fulfil Thy law\'s demands; could my zeal no respite know, could my tears for ever flow, all for sin could not atone: Thou must save, and Thou alone.' },
      { number: 3, text: 'Nothing in my hand I bring, simply to Thy cross I cling; naked, come to Thee for dress; helpless, look to Thee for grace; foul, I to the fountain fly: wash me, Saviour, or I die.' },
      { number: 4, text: 'While I draw this fleeting breath, when my eyelids close in death, when I soar to worlds unknown, see Thee on Thy judgement throne, Rock of Ages, cleft for me, let me hide myself in Thee.' },
    ],
  },
  {
    number: 465, title: 'And Can It Be',
    author: 'Charles Wesley (1738)',
    chorus: null,
    verses: [
      { number: 1, text: 'And can it be that I should gain an interest in the Saviour\'s blood? Died He for me, who caused His pain — for me, who Him to death pursued? Amazing love! How can it be, that Thou, my God, shouldst die for me?' },
      { number: 2, text: 'He left His Father\'s throne above — so free, so infinite His grace — emptied Himself of all but love, and bled for Adam\'s helpless race. \'Tis mercy all, immense and free, for O my God, it found out me!' },
      { number: 3, text: 'No condemnation now I dread; Jesus, and all in Him, is mine; Alive in Him, my living Head, and clothed in righteousness divine, bold I approach the eternal throne, and claim the crown, through Christ my own.' },
    ],
  },
  {
    number: 480, title: 'To God Be the Glory',
    author: 'Fanny Crosby (1875)',
    chorus: 'Praise the Lord, praise the Lord! Let the earth hear His voice! Praise the Lord, praise the Lord! Let the people rejoice! O come to the Father, through Jesus the Son, and give Him the glory — great things He hath done!',
    verses: [
      { number: 1, text: 'To God be the glory, great things He hath taught us, great things He hath done, and great our rejoicing through Jesus the Son; but purer, and higher, and greater will be our wonder, our transport, when Jesus we see.' },
      { number: 2, text: 'O perfect redemption, the purchase of blood, to every believer the promise of God; the vilest offender who truly believes, that moment from Jesus a pardon receives.' },
      { number: 3, text: 'Great things He hath taught us, great things He hath done, and great our rejoicing through Jesus the Son; but purer, and higher, and greater will be our wonder, our transport, when Jesus we see.' },
    ],
  },
  {
    number: 503, title: 'Blessed Assurance',
    author: 'Fanny Crosby (1873)',
    chorus: 'This is my story, this is my song, praising my Saviour all the day long; this is my story, this is my song, praising my Saviour all the day long.',
    verses: [
      { number: 1, text: 'Blessed assurance, Jesus is mine! Oh, what a foretaste of glory divine! Heir of salvation, purchase of God, born of His Spirit, washed in His blood.' },
      { number: 2, text: 'Perfect submission, perfect delight, visions of rapture now burst on my sight; angels descending bring from above echoes of mercy, whispers of love.' },
      { number: 3, text: 'Perfect submission, all is at rest, I in my Saviour am happy and blest, watching and waiting, looking above, filled with His goodness, lost in His love.' },
    ],
  },
  {
    number: 512, title: 'There Is a Fountain Filled with Blood',
    author: 'William Cowper (1772)',
    chorus: null,
    verses: [
      { number: 1, text: 'There is a fountain filled with blood drawn from Emmanuel\'s veins; and sinners plunged beneath that flood lose all their guilty stains.' },
      { number: 2, text: 'The dying thief rejoiced to see that fountain in his day; and there may I, though vile as he, wash all my sins away.' },
      { number: 3, text: 'Dear dying Lamb, Thy precious blood shall never lose its power till all the ransomed church of God be saved, to sin no more.' },
      { number: 4, text: 'E\'er since, by faith, I saw the stream Thy flowing wounds supply, redeeming love has been my theme, and shall be till I die.' },
    ],
  },
  {
    number: 528, title: 'Just As I Am',
    author: 'Charlotte Elliott (1835)',
    chorus: null,
    verses: [
      { number: 1, text: 'Just as I am, without one plea, but that Thy blood was shed for me, and that Thou bid\'st me come to Thee, O Lamb of God, I come, I come.' },
      { number: 2, text: 'Just as I am, and waiting not to rid my soul of one dark blot, to Thee whose blood can cleanse each spot, O Lamb of God, I come, I come.' },
      { number: 3, text: 'Just as I am, though tossed about with many a conflict, many a doubt, fightings and fears within, without, O Lamb of God, I come, I come.' },
      { number: 4, text: 'Just as I am, Thou wilt receive, wilt welcome, pardon, cleanse, relieve; because Thy promise I believe, O Lamb of God, I come, I come.' },
    ],
  },
  {
    number: 539, title: 'My Faith Looks Up to Thee',
    author: 'Ray Palmer (1830)',
    chorus: null,
    verses: [
      { number: 1, text: 'My faith looks up to Thee, Thou Lamb of Calvary, Saviour divine! Now hear me while I pray, take all my guilt away, O let me from this day be wholly Thine!' },
      { number: 2, text: 'May Thy rich grace impart strength to my fainting heart, my zeal inspire; as Thou hast died for me, O may my love to Thee pure, warm, and changeless be, a living fire!' },
      { number: 3, text: 'When ends life\'s transient dream, when death\'s cold sullen stream shall o\'er me roll; blest Saviour, then in love, fear and distrust remove; O bear me safe above, a ransomed soul!' },
    ],
  },
  {
    number: 720, title: 'The Church\'s One Foundation',
    author: 'Samuel Stone (1866)',
    chorus: null,
    verses: [
      { number: 1, text: 'The Church\'s one foundation is Jesus Christ her Lord; she is His new creation by water and the Word. From heaven He came and sought her to be His holy bride; with His own blood He bought her, and for her life He died.' },
      { number: 2, text: 'Elect from every nation, yet one o\'er all the earth; her charter of salvation one Lord, one faith, one birth; one holy name she blesses, partakes one holy food, and to one hope she presses, with every grace endued.' },
      { number: 3, text: 'Through toil and tribulation, and tumult of her war, she waits the consummation of peace for evermore; till with the vision glorious her longing eyes are blest, and the great Church victorious shall be the Church at rest.' },
    ],
  },
  {
    number: 719, title: 'Bind Us Together Lord',
    author: 'Bob Gillman (1977)',
    chorus: 'Bind us together, Lord, bind us together with cords that cannot be broken. Bind us together, Lord, bind us together, Lord, bind us together in love.',
    verses: [
      { number: 1, text: 'There is only one God, there is only one King; there is only one Body — that is why we sing.' },
      { number: 2, text: 'We are the family of God, we are the promise divine; we are God\'s chosen desire, we are the glorious new wine.' },
      { number: 3, text: 'You are the family of God, you are the promise divine; you are God\'s chosen desire, you are the glorious new wine.' },
    ],
  },
  {
    number: 721, title: 'O Perfect Love',
    author: 'Dorothy Gurney (1883)',
    chorus: null,
    verses: [
      { number: 1, text: 'O perfect Love, all human thought transcending, lowly we kneel in prayer before Thy throne, that theirs may be the love which knows no ending, whom Thou forevermore dost join in one.' },
      { number: 2, text: 'O perfect Life, be Thou their full assurance of tender charity and steadfast faith, of patient hope, and quiet brave endurance, with childlike trust that fears not pain nor death.' },
      { number: 3, text: 'Grant them the joy which brightens earthly sorrow; grant them the peace which calms all earthly strife; and to life\'s day the glorious unknown morrow that dawns upon eternal love and life.' },
    ],
  },
  {
    number: 762, title: 'God Be with You Till We Meet Again',
    author: 'Jeremiah Rankin (1882)',
    chorus: 'Till we meet, till we meet, till we meet at Jesus\' feet; till we meet, till we meet, God be with you till we meet again.',
    verses: [
      { number: 1, text: 'God be with you till we meet again; by His counsels guide, uphold you; with His sheep securely fold you: God be with you till we meet again.' },
      { number: 2, text: 'God be with you till we meet again; \'neath His wings protecting hide you, daily manna still provide you: God be with you till we meet again.' },
      { number: 3, text: 'God be with you till we meet again; keep love\'s banner floating o\'er you; smite death\'s threatening wave before you: God be with you till we meet again.' },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// UI TRANSLATIONS (app strings for all 4 languages)
// ─────────────────────────────────────────────────────────────────────────────
const UI_TRANSLATIONS = [
  // English
  { lang_code: 'en', key: 'cat_adult',            val: 'Adult Class' },
  { lang_code: 'en', key: 'cat_adult_short',       val: 'Adults' },
  { lang_code: 'en', key: 'cat_adult_hero',        val: 'Exposition on Philemon' },
  { lang_code: 'en', key: 'cat_adult_cta',         val: 'Begin Lessons' },
  { lang_code: 'en', key: 'cat_adult_tag',         val: 'ADULT CLASS' },
  { lang_code: 'en', key: 'cat_youth',             val: 'Youth Class' },
  { lang_code: 'en', key: 'cat_youth_short',       val: 'Youth' },
  { lang_code: 'en', key: 'cat_youth_hero',        val: 'Living the Christian Life' },
  { lang_code: 'en', key: 'cat_youth_cta',         val: 'Start Learning' },
  { lang_code: 'en', key: 'cat_youth_tag',         val: 'YOUTH CLASS' },
  { lang_code: 'en', key: 'cat_intermediate',      val: 'Intermediate Class' },
  { lang_code: 'en', key: 'cat_intermediate_short', val: 'Intermediate' },
  { lang_code: 'en', key: 'cat_intermediate_hero', val: 'Growing in Faith' },
  { lang_code: 'en', key: 'cat_intermediate_cta',  val: 'Explore Lessons' },
  { lang_code: 'en', key: 'cat_intermediate_tag',  val: 'INTERMEDIATE' },
  { lang_code: 'en', key: 'cat_children',          val: 'Children\'s Class' },
  { lang_code: 'en', key: 'cat_children_short',    val: 'Children' },
  { lang_code: 'en', key: 'cat_children_hero',     val: 'Following Jesus' },
  { lang_code: 'en', key: 'cat_children_cta',      val: 'Let\'s Learn!' },
  { lang_code: 'en', key: 'cat_children_tag',      val: 'CHILDREN' },
  { lang_code: 'en', key: 'cat_lessons13',         val: '13 Lessons' },
  { lang_code: 'en', key: 'cat_quarter',           val: 'Q4 2026' },
  { lang_code: 'en', key: 'home',                  val: 'Home' },
  { lang_code: 'en', key: 'lessons',               val: 'Lessons' },
  { lang_code: 'en', key: 'read',                  val: 'Read' },
  { lang_code: 'en', key: 'saved',                 val: 'Saved' },
  { lang_code: 'en', key: 'settings',              val: 'Settings' },
  { lang_code: 'en', key: 'categories',            val: 'Categories' },
  { lang_code: 'en', key: 'viewAll',               val: 'View all' },
  { lang_code: 'en', key: 'thisQuarter',           val: 'This Quarter' },
  { lang_code: 'en', key: 'quarterPeriod',         val: 'QUARTER PERIOD' },
  { lang_code: 'en', key: 'memoryScripture',       val: 'MEMORY SCRIPTURE' },
  { lang_code: 'en', key: 'lesson',                val: 'Lesson' },
  { lang_code: 'en', key: 'searchPlaceholder',     val: 'Search lessons, topics…' },
  { lang_code: 'en', key: 'appearance',            val: 'APPEARANCE' },
  { lang_code: 'en', key: 'language',              val: 'LANGUAGE' },
  { lang_code: 'en', key: 'ageGroup',              val: 'AGE GROUP' },
  { lang_code: 'en', key: 'darkMode',              val: 'Dark Mode' },
  { lang_code: 'en', key: 'lightMode',             val: 'Light Mode' },
  { lang_code: 'en', key: 'footerOrg',             val: '© GOFAMINT Sunday School Department' },
  { lang_code: 'en', key: 'quizCtaTitle',          val: 'Test Your Knowledge' },
  { lang_code: 'en', key: 'quizCtaSub',            val: '5 questions · Earn up to 10 points per lesson' },
  { lang_code: 'en', key: 'quizFab',               val: 'Take Quiz' },
  { lang_code: 'en', key: 'quizNotifTitle',        val: 'Sunday School Quiz Time! ⚡' },
  { lang_code: 'en', key: 'quizNotifBody',         val: 'Test your knowledge of today\'s lesson and earn points!' },
  { lang_code: 'en', key: 'devNotifTitle',         val: 'Daily Devotional 📖' },
  { lang_code: 'en', key: 'devNotifBody',          val: 'Your daily devotional reading is ready. Start your day with God\'s Word.' },
  { lang_code: 'en', key: 'notificationsTitle',    val: 'NOTIFICATIONS' },
  { lang_code: 'en', key: 'quizReminder',          val: 'Quiz Reminder' },
  { lang_code: 'en', key: 'devotionalReminder',    val: 'Devotional Reminder' },
  { lang_code: 'en', key: 'notifEnabled',          val: 'Enabled' },
  { lang_code: 'en', key: 'notifDisabled',         val: 'Disabled' },
  { lang_code: 'en', key: 'notifAM',               val: 'AM' },
  { lang_code: 'en', key: 'notifPM',               val: 'PM' },
  { lang_code: 'en', key: 'reminderTime',          val: 'REMINDER TIME' },
  { lang_code: 'en', key: 'notifPermissionTitle',  val: 'Enable Notifications' },
  { lang_code: 'en', key: 'notifPermissionMsg',    val: 'Allow reminders for lessons and devotionals' },
  { lang_code: 'en', key: 'notifPermissionAllow',  val: 'Allow' },
  { lang_code: 'en', key: 'noUnits',               val: 'No units available.' },
  { lang_code: 'en', key: 'dailyDevotional',       val: 'Daily Devotional' },
  { lang_code: 'en', key: 'back',                  val: 'Back' },
  { lang_code: 'en', key: 'todayScripture',        val: 'TODAY\'S SCRIPTURE' },
  { lang_code: 'en', key: 'verseInstruction',      val: 'Read this passage in full. Meditate on it throughout the day.' },
  { lang_code: 'en', key: 'prayer',                val: 'Prayer' },
  { lang_code: 'en', key: 'reflection',            val: 'Reflection' },
  { lang_code: 'en', key: 'application',           val: 'Application' },
  { lang_code: 'en', key: 'highlighted',           val: 'Highlighted' },
  { lang_code: 'en', key: 'highlightPrompt',       val: 'Highlight This' },
  { lang_code: 'en', key: 'highlightMsg',          val: 'Long-press to save this section as a highlight.' },
  { lang_code: 'en', key: 'removeHighlight',       val: 'Remove Highlight' },
  { lang_code: 'en', key: 'removeMsg',             val: 'Remove this highlight from your saved list?' },
  { lang_code: 'en', key: 'doHighlight',           val: 'Highlight' },
  { lang_code: 'en', key: 'doRemove',              val: 'Remove' },
  { lang_code: 'en', key: 'cancel',                val: 'Cancel' },
  { lang_code: 'en', key: 'clearAll',              val: 'Clear All' },
  { lang_code: 'en', key: 'noHighlights',          val: 'Long-press any section to save a highlight.' },
  { lang_code: 'en', key: 'highlights',            val: '{{n}} Saved Highlight' },
  { lang_code: 'en', key: 'highlightsPlural',      val: '{{n}} Saved Highlights' },
  { lang_code: 'en', key: 'prevDay',               val: 'Prev' },
  { lang_code: 'en', key: 'nextDay',               val: 'Next' },
  { lang_code: 'en', key: 'dayOf',                 val: 'Day {{current}} of {{total}}' },

  // Yoruba
  { lang_code: 'yo', key: 'cat_adult',            val: 'Ìjọ Àgbàlagbà' },
  { lang_code: 'yo', key: 'cat_adult_short',       val: 'Àgbàlagbà' },
  { lang_code: 'yo', key: 'cat_adult_hero',        val: 'Ẹ̀kọ́ Lórí Philemon' },
  { lang_code: 'yo', key: 'cat_adult_cta',         val: 'Bẹ̀rẹ̀ Ẹ̀kọ́' },
  { lang_code: 'yo', key: 'cat_adult_tag',         val: 'ÌJỌ ÀGBÀLAGBÀ' },
  { lang_code: 'yo', key: 'cat_youth',             val: 'Ìjọ Ọ̀dọ́' },
  { lang_code: 'yo', key: 'cat_youth_short',       val: 'Ọ̀dọ́' },
  { lang_code: 'yo', key: 'cat_youth_hero',        val: 'Ìgbésí Ayé Kristẹni' },
  { lang_code: 'yo', key: 'cat_youth_cta',         val: 'Bẹ̀rẹ̀ Ìkẹ́kọ̀ọ́' },
  { lang_code: 'yo', key: 'cat_youth_tag',         val: 'ÌJỌ ỌDỌ́' },
  { lang_code: 'yo', key: 'cat_intermediate',      val: 'Ìjọ Àárín' },
  { lang_code: 'yo', key: 'cat_intermediate_short', val: 'Àárín' },
  { lang_code: 'yo', key: 'cat_intermediate_hero', val: 'Ìdàgbàsókè Nínú Ìgbàgbọ́' },
  { lang_code: 'yo', key: 'cat_intermediate_cta',  val: 'Ṣèwádìí Ẹ̀kọ́' },
  { lang_code: 'yo', key: 'cat_intermediate_tag',  val: 'ÀÁRÍN' },
  { lang_code: 'yo', key: 'cat_children',          val: 'Ìjọ Àwọn Ọmọdé' },
  { lang_code: 'yo', key: 'cat_children_short',    val: 'Ọmọdé' },
  { lang_code: 'yo', key: 'cat_children_hero',     val: 'Tẹ̀lé Jesu' },
  { lang_code: 'yo', key: 'cat_children_cta',      val: 'Jẹ́ Ká Kọ́!' },
  { lang_code: 'yo', key: 'cat_children_tag',      val: 'ÀWỌN ỌMỌDÉ' },
  { lang_code: 'yo', key: 'cat_lessons13',         val: 'Ẹ̀kọ́ 13' },
  { lang_code: 'yo', key: 'cat_quarter',           val: 'Ìdámẹ́rin 4, 2026' },
  { lang_code: 'yo', key: 'home',                  val: 'Ilé' },
  { lang_code: 'yo', key: 'lessons',               val: 'Àwọn Ẹ̀kọ́' },
  { lang_code: 'yo', key: 'read',                  val: 'Ka' },
  { lang_code: 'yo', key: 'settings',              val: 'Ètò' },
  { lang_code: 'yo', key: 'categories',            val: 'Àwọn Ẹgbẹ́' },
  { lang_code: 'yo', key: 'viewAll',               val: 'Wò Gbogbo' },
  { lang_code: 'yo', key: 'thisQuarter',           val: 'Ìdámẹ́rin Yìí' },
  { lang_code: 'yo', key: 'quarterPeriod',         val: 'ÀKÓKÒ ÌDÁMẸ́RIN' },
  { lang_code: 'yo', key: 'memoryScripture',       val: 'ÀYA ÌRÁNTÍ' },
  { lang_code: 'yo', key: 'lesson',                val: 'Ẹ̀kọ́' },
  { lang_code: 'yo', key: 'searchPlaceholder',     val: 'Wá àwọn ẹ̀kọ́, àwọn ìkànímọ̀…' },
  { lang_code: 'yo', key: 'appearance',            val: 'ÀWÒRÁN' },
  { lang_code: 'yo', key: 'language',              val: 'ÈDÈ' },
  { lang_code: 'yo', key: 'ageGroup',              val: 'ÈKA ÒJỌ́ OJÚ' },
  { lang_code: 'yo', key: 'darkMode',              val: 'Ọ̀nà Òkùnkùn' },
  { lang_code: 'yo', key: 'lightMode',             val: 'Ọ̀nà Ìmọ́lẹ̀' },
  { lang_code: 'yo', key: 'quizCtaTitle',          val: 'Ṣàyẹ̀wò Ìmọ̀ Rẹ' },
  { lang_code: 'yo', key: 'quizFab',               val: 'Ṣe Ìdánwò' },
  { lang_code: 'yo', key: 'noUnits',               val: 'Kò sí àwọn ẹgbẹ́ tó wà.' },
  { lang_code: 'yo', key: 'dailyDevotional',       val: 'Ìsinmi Ọjọ́ Tìtì' },
  { lang_code: 'yo', key: 'back',                  val: 'Padà' },
  { lang_code: 'yo', key: 'prayer',                val: 'Àdúrà' },
  { lang_code: 'yo', key: 'reflection',            val: 'Ìfọ̀kànsí' },
  { lang_code: 'yo', key: 'application',           val: 'Ìfọwọ́sí' },
  { lang_code: 'yo', key: 'cancel',                val: 'Fagilé' },

  // Igbo
  { lang_code: 'ig', key: 'cat_adult',            val: 'Ụlọ Ọzụzụ Ndị Okenye' },
  { lang_code: 'ig', key: 'cat_adult_short',       val: 'Ndị Okenye' },
  { lang_code: 'ig', key: 'cat_adult_hero',        val: 'Ọzụzụ Filemon' },
  { lang_code: 'ig', key: 'cat_adult_cta',         val: 'Malite Mmụta' },
  { lang_code: 'ig', key: 'cat_adult_tag',         val: 'NDỊ OKENYE' },
  { lang_code: 'ig', key: 'cat_youth',             val: 'Ụlọ Ọzụzụ Ọzụzụ Ndị Nta' },
  { lang_code: 'ig', key: 'cat_youth_short',       val: 'Ndị Nta' },
  { lang_code: 'ig', key: 'cat_youth_hero',        val: 'Ndụ Onye Kraịst' },
  { lang_code: 'ig', key: 'cat_youth_cta',         val: 'Malite Mmụta' },
  { lang_code: 'ig', key: 'cat_youth_tag',         val: 'NDỊ NTA' },
  { lang_code: 'ig', key: 'cat_intermediate',      val: 'Ụlọ Ọzụzụ Etiti' },
  { lang_code: 'ig', key: 'cat_intermediate_short', val: 'Etiti' },
  { lang_code: 'ig', key: 'cat_intermediate_hero', val: 'Ịtozụ n\'Okwukwe' },
  { lang_code: 'ig', key: 'cat_intermediate_cta',  val: 'Chọọ Ihe Ọmụmụ' },
  { lang_code: 'ig', key: 'cat_intermediate_tag',  val: 'ETITI' },
  { lang_code: 'ig', key: 'cat_children',          val: 'Ụlọ Ọzụzụ Ụmụaka' },
  { lang_code: 'ig', key: 'cat_children_short',    val: 'Ụmụaka' },
  { lang_code: 'ig', key: 'cat_children_hero',     val: 'Ịsogo Jizọs' },
  { lang_code: 'ig', key: 'cat_children_cta',      val: 'Ka Anyị Mụta!' },
  { lang_code: 'ig', key: 'cat_children_tag',      val: 'ỤMỤAKA' },
  { lang_code: 'ig', key: 'cat_lessons13',         val: 'Ihe Ọmụmụ 13' },
  { lang_code: 'ig', key: 'cat_quarter',           val: 'Q4 2026' },
  { lang_code: 'ig', key: 'home',                  val: 'Ụlọ' },
  { lang_code: 'ig', key: 'lessons',               val: 'Ihe Ọmụmụ' },
  { lang_code: 'ig', key: 'read',                  val: 'Gụọ' },
  { lang_code: 'ig', key: 'settings',              val: 'Ntọala' },
  { lang_code: 'ig', key: 'categories',            val: 'Ụdị' },
  { lang_code: 'ig', key: 'viewAll',               val: 'Lee Ha Nile' },
  { lang_code: 'ig', key: 'thisQuarter',           val: 'Ọnwa Atọ a' },
  { lang_code: 'ig', key: 'lesson',                val: 'Ihe Ọmụmụ' },
  { lang_code: 'ig', key: 'searchPlaceholder',     val: 'Chọọ ihe ọmụmụ, isiokwu…' },
  { lang_code: 'ig', key: 'language',              val: 'ASỤSỤ' },
  { lang_code: 'ig', key: 'noUnits',               val: 'Ọ dịghị otu dị.' },
  { lang_code: 'ig', key: 'dailyDevotional',       val: 'Ọgụgụ Nke Ụbọchị' },
  { lang_code: 'ig', key: 'back',                  val: 'Laghachi' },
  { lang_code: 'ig', key: 'prayer',                val: 'Ekpere' },
  { lang_code: 'ig', key: 'reflection',            val: 'Ihe Nghọta' },
  { lang_code: 'ig', key: 'application',           val: 'Mgbatụ' },
  { lang_code: 'ig', key: 'cancel',                val: 'Kagbuo' },

  // Hausa
  { lang_code: 'ha', key: 'cat_adult',            val: 'Ɗakin Karatu na Manya' },
  { lang_code: 'ha', key: 'cat_adult_short',       val: 'Manya' },
  { lang_code: 'ha', key: 'cat_adult_hero',        val: 'Koyarwa ta Filemon' },
  { lang_code: 'ha', key: 'cat_adult_cta',         val: 'Fara Karatu' },
  { lang_code: 'ha', key: 'cat_adult_tag',         val: 'MANYA' },
  { lang_code: 'ha', key: 'cat_youth',             val: 'Ɗakin Karatu na Matasa' },
  { lang_code: 'ha', key: 'cat_youth_short',       val: 'Matasa' },
  { lang_code: 'ha', key: 'cat_youth_hero',        val: 'Rayuwar Kirista' },
  { lang_code: 'ha', key: 'cat_youth_cta',         val: 'Fara Koyo' },
  { lang_code: 'ha', key: 'cat_youth_tag',         val: 'MATASA' },
  { lang_code: 'ha', key: 'cat_intermediate',      val: 'Ɗakin Karatu na Tsakiya' },
  { lang_code: 'ha', key: 'cat_intermediate_short', val: 'Tsakiya' },
  { lang_code: 'ha', key: 'cat_intermediate_hero', val: 'Girma a Imani' },
  { lang_code: 'ha', key: 'cat_intermediate_cta',  val: 'Bincika Darussa' },
  { lang_code: 'ha', key: 'cat_intermediate_tag',  val: 'TSAKIYA' },
  { lang_code: 'ha', key: 'cat_children',          val: 'Ɗakin Karatu na Yara' },
  { lang_code: 'ha', key: 'cat_children_short',    val: 'Yara' },
  { lang_code: 'ha', key: 'cat_children_hero',     val: 'Bi Yesu' },
  { lang_code: 'ha', key: 'cat_children_cta',      val: 'Bari Mu Koyi!' },
  { lang_code: 'ha', key: 'cat_children_tag',      val: 'YARA' },
  { lang_code: 'ha', key: 'cat_lessons13',         val: 'Darussa 13' },
  { lang_code: 'ha', key: 'cat_quarter',           val: 'Q4 2026' },
  { lang_code: 'ha', key: 'home',                  val: 'Gida' },
  { lang_code: 'ha', key: 'lessons',               val: 'Darussa' },
  { lang_code: 'ha', key: 'read',                  val: 'Karanta' },
  { lang_code: 'ha', key: 'settings',              val: 'Saiti' },
  { lang_code: 'ha', key: 'categories',            val: 'Rukunai' },
  { lang_code: 'ha', key: 'viewAll',               val: 'Duba Duka' },
  { lang_code: 'ha', key: 'thisQuarter',           val: 'Wannan Lokaci' },
  { lang_code: 'ha', key: 'lesson',                val: 'Darasi' },
  { lang_code: 'ha', key: 'searchPlaceholder',     val: 'Nemo darussa, batutuwa…' },
  { lang_code: 'ha', key: 'language',              val: 'HARSHE' },
  { lang_code: 'ha', key: 'noUnits',               val: 'Babu rukunai.' },
  { lang_code: 'ha', key: 'dailyDevotional',       val: 'Ibada ta Kullum' },
  { lang_code: 'ha', key: 'back',                  val: 'Koma' },
  { lang_code: 'ha', key: 'prayer',                val: 'Addu\'a' },
  { lang_code: 'ha', key: 'reflection',            val: 'Tunani' },
  { lang_code: 'ha', key: 'application',           val: 'Amfani' },
  { lang_code: 'ha', key: 'cancel',                val: 'Soke' },
];

// ─────────────────────────────────────────────────────────────────────────────
// MAIN SEED FUNCTION
// ─────────────────────────────────────────────────────────────────────────────
async function seed() {
  console.log('\n🌱 GOFAMINT Sunday School — Database Seed\n');

  // ── Test connection first ─────────────────────────────────────────────────
  try {
    const test = await db.query('SELECT current_user, current_database()');
    const { current_user, current_database } = test.rows[0];
    console.log(`  ✓  Connected as: ${current_user} @ ${current_database}\n`);
  } catch (connErr) {
    console.error(`
❌ Cannot connect to PostgreSQL.

   Error: ${connErr.message}

   Fix — add ONE of the following to your .env file:

   Option A (single URL):
     DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/gofamint

   Option B — your .env already uses DB_* vars (keep these):
     DB_USER=postgres
     DB_PASSWORD=your_pgadmin_password
     DB_HOST=localhost
     DB_NAME=gospeler
     DB_PORT=5432

   Then make sure the database exists:
     psql -U postgres -c "CREATE DATABASE gospeler;"   (already exists — you're good!)

   And run again:
     node seed.js
    `);
    process.exit(1);
  }

  try {
    // ── 1. Languages ──────────────────────────────────────────────────────────
    console.log('📌 Seeding languages...');
    for (const lang of LANGUAGES) {
      await run(`
        INSERT INTO languages (code, label, native_label, flag, is_active)
        VALUES ($1, $2, $3, $4, TRUE)
        ON CONFLICT (code) DO UPDATE
          SET label = EXCLUDED.label,
              native_label = EXCLUDED.native_label,
              flag = EXCLUDED.flag
      `, [lang.code, lang.label, lang.native_label, lang.flag]);
    }
    log(`Seeded ${LANGUAGES.length} languages`);

    // ── 2a. Schema migrations (safe — run before seeding) ────────────────────
    console.log('\n📌 Running schema migrations...');

    // Ensure categories table exists
    await run(`
      CREATE TABLE IF NOT EXISTS categories (
        id          VARCHAR(50)  PRIMARY KEY,
        label       VARCHAR(100) NOT NULL,
        description TEXT,
        color       VARCHAR(20)  DEFAULT '#2563EB',
        icon        VARCHAR(10)  DEFAULT '📖',
        sort_order  INTEGER      DEFAULT 0
      )
    `);
    await run(`
      INSERT INTO categories (id, label, description, color, icon, sort_order) VALUES
        ('adult',        'Adult Class',        'Expository study for adult members',          '#7C3AED', '📖', 1),
        ('youth',        'Youth Class',        'Life-application lessons for young people',   '#2563EB', '⚡', 2),
        ('intermediate', 'Intermediate Class', 'Bridge lessons for teens and young adults',   '#10B981', '🌱', 3),
        ('children',     'Children''s Class',  'Simple, illustrated lessons for children',    '#F97316', '🌟', 4)
      ON CONFLICT (id) DO UPDATE
        SET label = EXCLUDED.label, description = EXCLUDED.description,
            color = EXCLUDED.color, icon = EXCLUDED.icon
    `);

    // Add category_id to units if not present
    await run(`ALTER TABLE units ADD COLUMN IF NOT EXISTS category_id VARCHAR(50) DEFAULT 'adult'`);

    // Add category_id to lessons if not present
    await run(`ALTER TABLE lessons ADD COLUMN IF NOT EXISTS category_id VARCHAR(50) DEFAULT 'adult'`);

    // Drop old 'category' column if it exists (replaced by category_id)
    await run(`ALTER TABLE units DROP COLUMN IF EXISTS category`);

    log('Schema migrations applied');

    // ── 2. Units ──────────────────────────────────────────────────────────────
    console.log('\n📌 Seeding units...');
    for (const unit of UNITS) {
      await run(`
        INSERT INTO units (id, category_id, title, description, lesson_range, color, sort_order)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO UPDATE
          SET category_id  = EXCLUDED.category_id,
              title        = EXCLUDED.title,
              description  = EXCLUDED.description,
              lesson_range = EXCLUDED.lesson_range,
              color        = EXCLUDED.color,
              sort_order   = EXCLUDED.sort_order
      `, [unit.id, unit.category, unit.title, unit.description, unit.lesson_range, unit.color, unit.sort_order]);
    }
    log(`Seeded ${UNITS.length} units (4 categories × 3 units each)`);

    // ── 3. Lessons ────────────────────────────────────────────────────────────
    console.log('\n📌 Seeding lessons...');
    const lessonIdMap = {};

    for (const lesson of LESSONS) {
      // Delete existing lesson for this number+unit so we can re-insert cleanly
      await run('DELETE FROM lessons WHERE lesson_number = $1 AND unit_id = $2', [lesson.lesson_number, lesson.unit_id]);

      const res = await run(`
        INSERT INTO lessons (
          unit_id, category_id, lesson_number, title, lesson_date, topic, quarter_theme,
          suggested_hymns, devotional_reading, memory_verse, memory_verse_passage,
          lesson_background, lesson_conclusion, lesson_part, devotional_days,
          questions, sort_order
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
        RETURNING id
      `, [
        lesson.unit_id,
        lesson.unit_id.split('_')[0] || 'adult',
        lesson.lesson_number,
        lesson.title,
        lesson.lesson_date,
        lesson.topic,
        lesson.quarter_theme,
        lesson.suggested_hymns,
        lesson.devotional_reading,
        lesson.memory_verse,
        lesson.memory_verse_passage,
        lesson.lesson_background,
        lesson.lesson_conclusion,
        JSON.stringify(lesson.lesson_part),
        JSON.stringify(lesson.devotional_days),
        JSON.stringify(lesson.questions),
        lesson.sort_order,
      ]);

      lessonIdMap[lesson.lesson_number] = res.rows[0].id;
    }
    log(`Seeded ${LESSONS.length} lessons (adult category) — IDs: ${JSON.stringify(lessonIdMap)}`);

    // ── 4. Lesson Translations ────────────────────────────────────────────────
    console.log('\n📌 Seeding lesson translations...');

    // Safe truncate helper — guards all VARCHAR columns
    const safe = (val, max = 198) => (val || '').toString().substring(0, max);

    // ── English base translations ─────────────────────────────────────────────
    for (const lesson of LESSONS) {
      const lessonId = lessonIdMap[lesson.lesson_number];
      if (!lessonId) { warn('No ID for lesson ' + lesson.lesson_number); continue; }

      await run(
        `DELETE FROM lesson_translations WHERE lesson_id = $1 AND lang_code = 'en'`,
        [lessonId]
      );

      await run(
        `INSERT INTO lesson_translations (
           lesson_id, lang_code,
           title, topic, memory_verse,
           lesson_background, lesson_conclusion,
           lesson_part, devotional_days, questions,
           topic_for_adults, topic_for_youth,
           topic_for_intermediate, topic_for_children
         ) VALUES (
           $1, 'en',
           $2, $3, $4,
           $5, $6,
           $7, $8, $9,
           $10, $11, $12, $13
         )`,
        [
          lessonId,
          safe(lesson.title),
          lesson.topic             || null,
          lesson.memory_verse      || null,
          lesson.lesson_background || null,
          lesson.lesson_conclusion || null,
          JSON.stringify(lesson.lesson_part      || []),
          JSON.stringify(lesson.devotional_days  || []),
          JSON.stringify(lesson.questions        || []),
          lesson.topic_for_adults       || null,
          lesson.topic_for_youth        || null,
          lesson.topic_for_intermediate || null,
          lesson.topic_for_children     || null,
        ]
      );
    }
    log('Seeded English lesson translations');

    // ── Yoruba, Igbo, Hausa ───────────────────────────────────────────────────
    const LANG_MAPS = [
      { lang_code: 'yo', data: YO_TRANSLATIONS },
      { lang_code: 'ig', data: IG_TRANSLATIONS },
      { lang_code: 'ha', data: HA_TRANSLATIONS },
    ];

    for (const { lang_code, data } of LANG_MAPS) {
      for (const lesson of LESSONS) {
        const lessonId = lessonIdMap[lesson.lesson_number];
        if (!lessonId) continue;

        const t = data[lesson.lesson_number] || {};

        // Safely truncate everything that touches VARCHAR(200)
        const title   = safe(t.title   || lesson.title);
        const topic   = t.topic        || lesson.topic        || null;
        const mv      = t.memory_verse || lesson.memory_verse || null;
        const tadults = t.topic        || lesson.topic_for_adults       || null;
        const tyouth  = lesson.topic_for_youth        || null;
        const tinter  = lesson.topic_for_intermediate || null;
        const tchild  = lesson.topic_for_children     || null;

        await run(
          `DELETE FROM lesson_translations WHERE lesson_id = $1 AND lang_code = $2`,
          [lessonId, lang_code]
        );

        await run(
          `INSERT INTO lesson_translations (
             lesson_id, lang_code,
             title, topic, memory_verse,
             lesson_background, lesson_conclusion,
             lesson_part, devotional_days, questions,
             topic_for_adults, topic_for_youth,
             topic_for_intermediate, topic_for_children
           ) VALUES (
             $1, $2,
             $3, $4, $5,
             $6, $7,
             $8, $9, $10,
             $11, $12, $13, $14
           )`,
          [
            lessonId, lang_code,
            title, topic, mv,
            lesson.lesson_background || null,
            lesson.lesson_conclusion || null,
            JSON.stringify(lesson.lesson_part      || []),
            JSON.stringify(lesson.devotional_days  || []),
            JSON.stringify(lesson.questions        || []),
            tadults, tyouth, tinter, tchild,
          ]
        );
      }
      log('Seeded ' + lang_code.toUpperCase() + ' translations for ' + LESSONS.length + ' lessons');
    }

    // ── 5. UI Translation Strings ─────────────────────────────────────────────
    console.log('\n📌 Seeding UI translations...');
    for (const tr of UI_TRANSLATIONS) {
      await run(`
        INSERT INTO translations (lang_code, key, value)
        VALUES ($1, $2, $3)
        ON CONFLICT (lang_code, key) DO UPDATE SET value = EXCLUDED.value
      `, [tr.lang_code, tr.key, tr.val]);
    }
    log(`Seeded ${UI_TRANSLATIONS.length} UI translation strings (EN/YO/IG/HA)`);

    // ── 6. Hymns ──────────────────────────────────────────────────────────────
    console.log('\n📌 Seeding hymns...');
    for (const hymn of HYMNS) {
      await run(`
        INSERT INTO hymns (number, title, author, chorus, verses)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (number) DO UPDATE
          SET title = EXCLUDED.title,
              author = EXCLUDED.author,
              chorus = EXCLUDED.chorus,
              verses = EXCLUDED.verses
      `, [hymn.number, hymn.title, hymn.author, hymn.chorus, JSON.stringify(hymn.verses)]);
    }
    log(`Seeded ${HYMNS.length} hymns`);

    // ── 7. Category→Language mapping ─────────────────────────────────────────
    console.log('\n📌 Seeding category language defaults...');
    const catLangDefaults = [
      { category_id: 'adult',        lang_code: 'en' },
      { category_id: 'youth',        lang_code: 'en' },
      { category_id: 'intermediate', lang_code: 'en' },
      { category_id: 'children',     lang_code: 'en' },
    ];
    for (const cl of catLangDefaults) {
      await run(`
        INSERT INTO category_languages (category_id, lang_code)
        VALUES ($1, $2)
        ON CONFLICT (category_id) DO UPDATE SET lang_code = EXCLUDED.lang_code
      `, [cl.category_id, cl.lang_code]);
    }
    log('Seeded category language defaults');

    // ── 8. Category translations (YO/IG/HA) ──────────────────────────────────
    console.log('\n📌 Seeding category translations...');

    // Ensure table exists (may not exist in old DBs)
    await run(`
      CREATE TABLE IF NOT EXISTS category_translations (
        id          SERIAL       PRIMARY KEY,
        category_id VARCHAR(50)  NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
        lang_code   VARCHAR(10)  NOT NULL REFERENCES languages(code) ON DELETE CASCADE,
        label       VARCHAR(100),
        description TEXT,
        updated_at  TIMESTAMPTZ  DEFAULT NOW(),
        UNIQUE (category_id, lang_code)
      )
    `);

    const CATEGORY_TRANSLATIONS = [
      // ── Yoruba ──────────────────────────────────────────────────────────────
      { category_id: 'adult',        lang_code: 'yo', label: `Ẹgbẹ́ Àgbàlagbà`,       description: `Ẹ̀kọ́ tí a tú sílẹ̀ fún àwọn ẹgbẹ́ àgbàlagbà nínú Ìjọ` },
      { category_id: 'youth',        lang_code: 'yo', label: `Ẹgbẹ́ Ọ̀dọ́`,            description: `Àwọn ẹ̀kọ́ ìmúṣe ìgbésí fún àwọn ọ̀dọ́ Kristẹni` },
      { category_id: 'intermediate', lang_code: 'yo', label: `Ẹgbẹ́ Àárín`,            description: `Àwọn ẹ̀kọ́ fún àwọn ọ̀dọ́ àgbàlagbà tí wọ́n ń dàgbà nínú ìgbàgbọ́` },
      { category_id: 'children',     lang_code: 'yo', label: `Ẹgbẹ́ Àwọn Ọmọdé`,      description: `Àwọn ẹ̀kọ́ tó rọrùn pẹ̀lú àwòrán fún àwọn ọmọdé` },
      // ── Igbo ────────────────────────────────────────────────────────────────
      { category_id: 'adult',        lang_code: 'ig', label: `Ụlọ Ọzụzụ Ndị Okenye`,   description: `Ọzụzụ nke ndị okenye n'ọha` },
      { category_id: 'youth',        lang_code: 'ig', label: `Ụlọ Ọzụzụ Ndị Nta`,      description: `Ihe ọmụmụ ndụ maka ụmụ okorobia na ụmụ agbọghọ` },
      { category_id: 'intermediate', lang_code: 'ig', label: `Ụlọ Ọzụzụ Etiti`,         description: `Ihe ọmụmụ maka ụmụ ntorobịa na ndị okenye nta` },
      { category_id: 'children',     lang_code: 'ig', label: `Ụlọ Ọzụzụ Ụmụaka`,        description: `Ihe ọmụmụ dị mfe, nwere ụtụ maka ụmụaka` },
      // ── Hausa ───────────────────────────────────────────────────────────────
      { category_id: 'adult',        lang_code: 'ha', label: `Darasin Manya`,             description: `Karatun bayani ga mambobin manya na coci` },
      { category_id: 'youth',        lang_code: 'ha', label: `Darasin Matasa`,            description: `Darussa na rayuwar aiki ga matasa Kirista` },
      { category_id: 'intermediate', lang_code: 'ha', label: `Darasin Tsakiya`,           description: `Darussa don matasa da manya tsofaffi` },
      { category_id: 'children',     lang_code: 'ha', label: `Darasin Yara`,              description: `Darussa masu sauqi da hotunan yara` },
    ];

    for (const ct of CATEGORY_TRANSLATIONS) {
      await run(`
        INSERT INTO category_translations (category_id, lang_code, label, description)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (category_id, lang_code) DO UPDATE
          SET label=EXCLUDED.label, description=EXCLUDED.description
      `, [ct.category_id, ct.lang_code, ct.label, ct.description]);
    }
    log(`Seeded ${CATEGORY_TRANSLATIONS.length} category translations (YO/IG/HA)`);

    // ── 9. Unit translations (YO/IG/HA) ──────────────────────────────────────
    console.log('\n📌 Seeding unit translations...');

    // Ensure table exists
    await run(`
      CREATE TABLE IF NOT EXISTS unit_translations (
        id           SERIAL       PRIMARY KEY,
        unit_id      VARCHAR(50)  NOT NULL REFERENCES units(id) ON DELETE CASCADE,
        lang_code    VARCHAR(10)  NOT NULL REFERENCES languages(code) ON DELETE CASCADE,
        title        VARCHAR(255),
        description  TEXT,
        lesson_range VARCHAR(50),
        updated_at   TIMESTAMPTZ  DEFAULT NOW(),
        UNIQUE (unit_id, lang_code)
      )
    `);
    // Add lesson_range column if the table was created in a previous run without it
    await run(`ALTER TABLE unit_translations ADD COLUMN IF NOT EXISTS lesson_range VARCHAR(50)`);

    const UNIT_TRANSLATIONS = [
      // ═══════════════════════════════ ADULT ═══════════════════════════════════
      { unit_id: 'adult_unit_1', lang_code: 'yo', title: `Ìbẹ̀rẹ̀ sí Ìgbésí Ayé Kristẹni`,          description: `Ìpilẹ̀ṣẹ̀ ìdékòjọ Kristẹni, ìdánimọ̀ àti ìpè nínú Kristi Jesu`,            lesson_range: `Àwọn Ẹ̀kọ́ 1–4`  },
      { unit_id: 'adult_unit_1', lang_code: 'ig', title: `Mmalite n'Ndụ Onye Kraịst`,               description: `Ntọala nke mmekọahụ Kraịst, njirimara, na ọrụ n'ime Kraịst Jizọs`,       lesson_range: `Ihe Ọmụmụ 1–4`   },
      { unit_id: 'adult_unit_1', lang_code: 'ha', title: `Gabatarwa ga Rayuwar Kirista`,             description: `Tushen tarayyar Kirista, asali, da kiran Allah cikin Yesu Almasihu`,      lesson_range: `Darussa 1–4`      },
      { unit_id: 'adult_unit_2', lang_code: 'yo', title: `Àwọn Ọ̀nà Ìfẹ́ Kristẹni ní Ìgbésí Ayé`,  description: `Bí ìdáríjì, ìṣọkan àti iṣẹ́ ṣe ṣàpẹẹrẹ ẹ̀rí Kristẹni`,                  lesson_range: `Àwọn Ẹ̀kọ́ 5–9`  },
      { unit_id: 'adult_unit_2', lang_code: 'ig', title: `Ihe Ngosipụta Nke Ịhụnanya Kraịst`,       description: `Otu igwe mmehie, nghọta, na ọrụ si egosi ihe amà nke Onye Kraịst`,         lesson_range: `Ihe Ọmụmụ 5–9`   },
      { unit_id: 'adult_unit_2', lang_code: 'ha', title: `Hanyoyin Nuna Kaunar Kirista`,             description: `Yadda gafara, sulhu da hidima ke nuna shaidan Kirista`,                    lesson_range: `Darussa 5–9`      },
      { unit_id: 'adult_unit_3', lang_code: 'yo', title: `Ìgbésí Ayé Kristẹni ní Àwùjọ`,           description: `Ṣíṣe àfihàn àwọn ìlànà Kristẹni nínú gbogbo àjọṣepọ̀ àti apá ìgbésí ayé`, lesson_range: `Àwọn Ẹ̀kọ́ 10–13`},
      { unit_id: 'adult_unit_3', lang_code: 'ig', title: `Ndụ Onye Kraịst n'Obodo`,                description: `Igosi ukpuru Kraịst n'mmeko niile na akụkụ ndụ`,                           lesson_range: `Ihe Ọmụmụ 10–13` },
      { unit_id: 'adult_unit_3', lang_code: 'ha', title: `Rayuwar Kirista a Cikin Al'umma`,         description: `Nuna darajar Kirista a cikin kowane dangantaka da fagen rayuwa`,            lesson_range: `Darussa 10–13`    },
      // ═══════════════════════════════ YOUTH ═══════════════════════════════════
      { unit_id: 'youth_unit_1', lang_code: 'yo', title: `Ta Ni Mi ninu Kristi?`,                   description: `Iwari idanimo ati ete re gege bi odo Kristeni`,                            lesson_range: `Awon Eko 1–4`     },
      { unit_id: 'youth_unit_1', lang_code: 'ig', title: `Onye Bu M N'ime Kraist?`,                 description: `Ichoputa njirimara gi na ebumnobi gi di ka onye Kraist ntorobi`,           lesson_range: `Ihe Omumu 1–4`    },
      { unit_id: 'youth_unit_1', lang_code: 'ha', title: `Ni Wane Ne a Cikin Almasihu?`,            description: `Gano asalinku da manufarku a matsayin saurayi Kirista`,                    lesson_range: `Darussa 1–4`      },
      { unit_id: 'youth_unit_2', lang_code: 'yo', title: `Igbepade Igbagbo Mi`,                     description: `Awon igbese ni imuse lati fi igbagbo re han ni ile-eko, idile ati awujo`,   lesson_range: `Awon Eko 5–9`     },
      { unit_id: 'youth_unit_2', lang_code: 'ig', title: `Ibi Ndu Site n'Okwukwe M`,               description: `Usoro di ime iji gosiputa okwukwe gi n'ulo akwukwo, ezinulo, na obodo`,    lesson_range: `Ihe Omumu 5–9`    },
      { unit_id: 'youth_unit_2', lang_code: 'ha', title: `Rayuwa ta Bangaskiyata`,                  description: `Matakai na aiwatarwa don nuna bangaskiyarku a makaranta, iyali, da al'umma`, lesson_range: `Darussa 5–9`   },
      { unit_id: 'youth_unit_3', lang_code: 'yo', title: `Idari ati Ise Kristeni`,                  description: `Didara ijoba alaanu to n nipa lori awon elomiran fun Kristi`,               lesson_range: `Awon Eko 10–13`   },
      { unit_id: 'youth_unit_3', lang_code: 'ig', title: `Ochichoo na Oru Onye Kraist`,             description: `Ibu onye ndu o bula na-eje n'iru ndi ozo maka Kraist`,                     lesson_range: `Ihe Omumu 10–13`  },
      { unit_id: 'youth_unit_3', lang_code: 'ha', title: `Jagoranci da Hidima ta Kirista`,          description: `Zama jagora mai hidima wanda ke tasiri wa wasu saboda Almasihu`,            lesson_range: `Darussa 10–13`    },
      // ══════════════════════════ INTERMEDIATE ═════════════════════════════════
      { unit_id: 'intermediate_unit_1', lang_code: 'yo', title: `Idagbasoke ninu Ore-ofe`,          description: `Eko awon iwa idagbasoke to maa n fun ihuwasi Kristeni lagbara`,             lesson_range: `Awon Eko 1–4`     },
      { unit_id: 'intermediate_unit_1', lang_code: 'ig', title: `Ịtozụ n'Obi Ebere`,               description: `Imuta ihe omume ndu na-eme ka odidi Kraist sie ike`,                       lesson_range: `Ihe Omumu 1–4`    },
      { unit_id: 'intermediate_unit_1', lang_code: 'ha', title: `Girma a Cikin Alheri`,             description: `Koyon halaye da suka karfafa halayen Kirista`,                              lesson_range: `Darussa 1–4`      },
      { unit_id: 'intermediate_unit_2', lang_code: 'yo', title: `Awon Ore ati Idekojo`,             description: `Oye nipa ore Kristeni, idariji ati awujo`,                                 lesson_range: `Awon Eko 5–9`     },
      { unit_id: 'intermediate_unit_2', lang_code: 'ig', title: `Ndi Enyi na Mmekoahu`,             description: `Ighota enyi Kraist, igwe mmehie, na obodo`,                                lesson_range: `Ihe Omumu 5–9`    },
      { unit_id: 'intermediate_unit_2', lang_code: 'ha', title: `Abokanci da Tarayya`,              description: `Fahimtar abotanci Kirista, gafara, da al'umma`,                            lesson_range: `Darussa 5–9`      },
      { unit_id: 'intermediate_unit_3', lang_code: 'yo', title: `Ise fun Olorun ati Awon Elomiran`, description: `Iwari bi a se n sisise fun Olorun nipa sisisise fun awon to wa ni ayika wa`, lesson_range: `Awon Eko 10–13`   },
      { unit_id: 'intermediate_unit_3', lang_code: 'ig', title: `Inye Oru nye Chukwu na Ndi Ozo`,  description: `Ichoputa otu esi ejere Chukwu ozi site n'iru oru nye ndi di gburugburu anyi`, lesson_range: `Ihe Omumu 10–13`},
      { unit_id: 'intermediate_unit_3', lang_code: 'ha', title: `Bauta wa Allah da Sauran Mutane`,  description: `Gano yadda ake bauta wa Allah ta hidima ga mutanen da ke kewaye da mu`,     lesson_range: `Darussa 10–13`    },
      // ══════════════════════════ CHILDREN ═════════════════════════════════════
      { unit_id: 'children_unit_1', lang_code: 'yo', title: `Emi Je Omo Olorun`,                    description: `Awon otito rorùn nipa jije olufe ati eni ti a yan fun Olorun`,              lesson_range: `Awon Eko 1–4`     },
      { unit_id: 'children_unit_1', lang_code: 'ig', title: `Abu M Nwa Chukwu`,                     description: `Eziokwu di mfe gbasara ihunanya Chukwu na ihoroo anyi`,                    lesson_range: `Ihe Omumu 1–4`    },
      { unit_id: 'children_unit_1', lang_code: 'ha', title: `Ni Yaro ne Allah`,                     description: `Gaskiya mai sauqi game da kasancewa an so kuma an zaba ta Allah`,           lesson_range: `Darussa 1–4`      },
      { unit_id: 'children_unit_2', lang_code: 'yo', title: `Je Olufe Bi Jesu`,                     description: `Eko bi a se n je olufe, olusanloowo ati oludaiji bi Jesu ti fihan wa`,      lesson_range: `Awon Eko 5–9`     },
      { unit_id: 'children_unit_2', lang_code: 'ig', title: `Ibu Onye Oma Di Ka Jizos`,             description: `Imuta ibu onye oma, onye enyemaka, na onye igwe mmehie di ka Jizos gosiri`, lesson_range: `Ihe Omumu 5–9`    },
      { unit_id: 'children_unit_2', lang_code: 'ha', title: `Zama Mai Kyauta Kamar Yesu`,           description: `Koyon zama mai kirki, mai taimako, da mai gafara kamar yadda Yesu ya nuna`, lesson_range: `Darussa 5–9`      },
      { unit_id: 'children_unit_3', lang_code: 'yo', title: `Pinda Ife Olorun`,                     description: `Bi a se n pin ife Olorun pelu idile, awon ore ati awon ara aduugbo`,        lesson_range: `Awon Eko 10–13`   },
      { unit_id: 'children_unit_3', lang_code: 'ig', title: `Ikekoorita Ihunanya Chukwu`,           description: `Otu esi ekekoorita ihunanya Chukwu na ezinulo, ndi enyi na ndi agbata obi`, lesson_range: `Ihe Omumu 10–13`  },
      { unit_id: 'children_unit_3', lang_code: 'ha', title: `Raba Soyayyar Allah`,                  description: `Yadda ake raba soyayyar Allah ga iyali, abokai da makwabta`,                lesson_range: `Darussa 10–13`    },
    ]

    for (const ut of UNIT_TRANSLATIONS) {
      await run(`
        INSERT INTO unit_translations (unit_id, lang_code, title, description, lesson_range)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (unit_id, lang_code) DO UPDATE
          SET title=EXCLUDED.title, description=EXCLUDED.description, lesson_range=EXCLUDED.lesson_range
      `, [ut.unit_id, ut.lang_code, ut.title, ut.description, ut.lesson_range]);
    }
    log(`Seeded ${UNIT_TRANSLATIONS.length} unit translations (12 units × 3 languages)`);


    // ── Verify actual DB row counts ──────────────────────────────────────────
    const ct = (await run(`
      SELECT
        (SELECT count(*) FROM languages)           AS langs,
        (SELECT count(*) FROM units)               AS units,
        (SELECT count(*) FROM lessons)             AS lessons,
        (SELECT count(*) FROM lesson_translations) AS ltr,
        (SELECT count(*) FROM hymns)               AS hymns,
        (SELECT count(*) FROM translations)        AS ui
    `)).rows[0];
    console.log('\n  Verified DB row counts:');
    console.log('    languages:           ' + ct.langs);
    console.log('    units:               ' + ct.units);
    console.log('    lessons:             ' + ct.lessons);
    console.log('    lesson_translations: ' + ct.ltr);
    console.log('    hymns:               ' + ct.hymns);
    console.log('    ui translations:     ' + ct.ui + '\n');

    // ── Summary ───────────────────────────────────────────────────────────────
    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ SEED COMPLETE

   Languages:           ${LANGUAGES.length} (EN, YO, IG, HA)
   Units:               ${UNITS.length} (4 categories × 3 units)
   Lessons:             ${LESSONS.length} (full adult content)
   Lesson translations: ${LESSONS.length * 4} (EN + YO + IG + HA)
   UI strings:          ${UI_TRANSLATIONS.length}
   Hymns:               ${HYMNS.length}

   Quarter: Q4 2026
   Theme:   Demonstration of the Christian Life
   Book:    Exposition on the Book of Philemon
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);

  } catch (err) {
    console.error('\n❌ Seed failed:', err.message);
    console.error(err.stack);
    process.exit(1);
  } finally {
    await db.end();
  }
}

seed();