import {
  EvidenceGrid,
  FlowDiagram,
  MetricStrip,
  ReferenceBlock,
} from "../components/PageScaffold";
import englishCornerPresentersUrl from "../assets/hp/education/english-corner-presenters.webp";
import englishCornerVoteUrl from "../assets/hp/education/english-corner-vote.webp";
import englishCornerWorkshopUrl from "../assets/hp/education/english-corner-workshop.webp";
import primaryClassroomInteractionUrl from "../assets/hp/education/primary-classroom-interaction.webp";
import primaryQuestionnaireUrl from "../assets/hp/education/primary-questionnaire.webp";
import primarySynbioClassroomUrl from "../assets/hp/education/primary-synbio-classroom.webp";

const educationMetrics = [
  {
    label: "Audience",
    value: "Primary school + university",
    note: "Two outreach formats tested the same health-and-synthetic-biology story at different levels of prior knowledge.",
  },
  {
    label: "Method",
    value: "Questionnaire -> activity -> feedback",
    note: "Both activities used structured prompts so the team could hear what participants understood, missed, and wanted to discuss next.",
  },
  {
    label: "Theme",
    value: "Steroids in daily health",
    note: "Vitamin D, sunlight, sleep, stress, diet, and endocrine rhythms became the bridge from the project to everyday decisions.",
  },
  {
    label: "Output",
    value: "Iterated education plan",
    note: "Feedback now points to more hands-on time, clearer vocabulary, and reusable bilingual materials.",
  },
];

const educationEvents = [
  {
    status: "May 12",
    title: "Sunshine Health Code at Helie Primary School",
    description:
      "A 45-minute class for fifth-grade students connected sunlight, vitamin D, steroid precursors, and the idea of a microbial factory through stories, experiments, drawing, and pre/post questionnaires.",
    metric: "Plan-Do-Check-Improve",
    href: "#primary-school",
  },
  {
    status: "May 15",
    title: "English Corner: From Online Tips to Daily Habits",
    description:
      "A bilingual workshop for university students used sleep, cortisol, melatonin, insulin, ghrelin, and leptin to turn online health advice into science-based routines.",
    metric: "Bilingual dialogue",
    href: "#english-corner",
  },
  {
    status: "Next",
    title: "Reusable outreach kit",
    description:
      "The materials point toward clearer vocabulary lists, more interactive modules, and social-media follow-up so each activity becomes a resource for the next audience.",
    metric: "Public learning loop",
    href: "#iteration",
  },
];

const primaryGallery = [
  {
    src: primaryQuestionnaireUrl,
    alt: "Students filling in the pre-activity questionnaire during the vitamin D outreach class.",
    title: "Pre-class questionnaire",
    caption:
      "The class began by asking students how they understood sunlight, vitamin D, outdoor habits, and microbial problem-solving.",
  },
  {
    src: primarySynbioClassroomUrl,
    alt: "A team member explaining synthetic biology to primary-school students.",
    title: "Microbial factory story",
    caption:
      "Synthetic biology was introduced through the concrete image of friendly microbes producing useful nutritional building blocks.",
  },
  {
    src: primaryClassroomInteractionUrl,
    alt: "Students interacting with the Jiangnan-China iGEM team during the class.",
    title: "Classroom interaction",
    caption:
      "Question prompts and drawing tasks helped the team see where abstract biological language became understandable.",
  },
];

const englishGallery = [
  {
    src: englishCornerPresentersUrl,
    alt: "Team members presenting the English Corner health workshop.",
    title: "Bilingual introduction",
    caption:
      "The activity used English explanations to connect steroid-related hormones with daily health habits.",
  },
  {
    src: englishCornerVoteUrl,
    alt: "University students voting during the English Corner activity.",
    title: "Hands-up diagnosis",
    caption:
      "Warm-up voting and a risk self-assessment made the discussion start from participants' own routines.",
  },
  {
    src: englishCornerWorkshopUrl,
    alt: "Participants working together during the English Corner workshop.",
    title: "Action schedule design",
    caption:
      "Participants translated hormone concepts into rest-day schedules, sleep routines, stress management, and diet choices.",
  },
];

const educationReferences = [
  {
    label: "iGEM Special Prizes: Education",
    href: "https://competition.igem.org/judging/special-prizes",
    note: "The 2026 competition page is still being updated, so the current reference keeps the 2025 Education judging language visible.",
  },
  {
    label: "iGEM Human Practices Hub",
    href: "https://responsibility.igem.org/human-practices/what-is-human-practices",
    note: "Frames outreach as two-way learning and reminds teams to distinguish Education from Integrated Human Practices.",
  },
  {
    label: "iGEM Surveys and Interviews guidance",
    href: "https://responsibility.igem.org/guidance/surveys-and-interviews",
    note: "Useful for keeping questionnaires, feedback collection, and public-facing evidence responsible.",
  },
];

function EducationGallery({
  title,
  items,
}: {
  title: string;
  items: typeof primaryGallery;
}) {
  return (
    <div className="education-gallery" aria-label={title}>
      {items.map((item) => (
        <figure className="education-gallery-card" key={item.title}>
          <img src={item.src} alt={item.alt} />
          <figcaption>
            <strong>{item.title}</strong>
            <span>{item.caption}</span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

export function Education() {
  return (
    <>
      <section id="overview" className="story-section story-section-first">
        <div className="section-heading">
          <h2>Education should become a dialogue, not a lecture</h2>
          <p>
            This round of Human Practices materials gives the Education page two
            concrete activities: a primary-school vitamin D class and a
            university English Corner. Together, they show how the team changed
            the language, format, and next outreach plan after listening to
            different audiences.
          </p>
        </div>
        <MetricStrip items={educationMetrics} />
        <div className="story-band">
          <div>
            <span className="story-band-label">Education logic</span>
            <h2 className="story-band-title">
              Use daily health as the doorway into synthetic biology.
            </h2>
          </div>
          <p className="story-band-text">
            Vitamin D, sunlight, sleep, stress, and endocrine rhythms made
            steroid-related biology easier to discuss before the audience met
            the full technical platform.
          </p>
        </div>
        <EvidenceGrid items={educationEvents} />
      </section>

      <section id="primary-school" className="story-section">
        <div className="section-heading">
          <span className="section-kicker">Primary-school outreach</span>
          <h2>Sunshine Health Code turned vitamin D into a hands-on story</h2>
          <p>
            Before the class, the team used a short questionnaire to learn what
            students already knew about sunlight, vitamin D, outdoor habits, and
            microbes. The lesson then focused on two gaps from that survey: many
            students thought vitamin D mainly came from food, and many had not
            seen how microbes could help make medicines or nutrients.
          </p>
        </div>
        <div className="split-layout">
          <article className="content-card narrative-card">
            <span className="track-tag">What happened</span>
            <ul className="card-list">
              <li>
                Students followed the journey from sunlight to skin, liver,
                kidney, active vitamin D, and calcium absorption.
              </li>
              <li>
                UVB beads and a glass barrier experiment made the “do not
                sunbathe through glass” point visible.
              </li>
              <li>
                The microbial factory section invited students to imagine how
                engineered microorganisms could make useful steroid precursors.
              </li>
              <li>
                Post-class questionnaires and drawings captured what concepts
                remained memorable and where wording still needed work.
              </li>
            </ul>
          </article>
          <article className="content-card narrative-card">
            <span className="track-tag">What changed</span>
            <ul className="card-list">
              <li>
                Future versions will reserve more time for student-operated
                experiments because the UVB activity drew the strongest
                participation.
              </li>
              <li>
                The same topic will be split into primary-school, middle-school,
                and high-school versions instead of one universal script.
              </li>
              <li>
                Follow-up outreach will explain “vitamin D needs help from
                sunlight and biology” before introducing abstract pathway
                language.
              </li>
            </ul>
          </article>
        </div>
        <EducationGallery
          title="Primary-school evidence photos"
          items={primaryGallery}
        />
      </section>

      <section id="english-corner" className="story-section">
        <div className="section-shell section-shell-amber">
          <FlowDiagram
            title="English Corner linked online health advice to steroid-related hormones"
            lead="The university workshop used English practice as the interface: students first diagnosed daily habits, then connected those habits to endocrine signals, then designed a small personal action plan."
            variant="linear"
            steps={[
              {
                label: "Warm-up",
                title: "Start from real habits",
                text: "Participants voted on late nights, caffeine, saved online tips, regular meals, outdoor time, and exercise.",
              },
              {
                label: "Science",
                title: "Explain body signals",
                text: "Melatonin, cortisol, insulin, ghrelin, leptin, and serotonin were matched with sleep, stress, appetite, and metabolism.",
              },
              {
                label: "Dialogue",
                title: "Discuss what is hard to change",
                text: "Participants shared routines that worked for them and asked follow-up questions, including why cortisol peaks around waking.",
              },
              {
                label: "Action",
                title: "Build a realistic schedule",
                text: "The session ended with personal rest-day schedules and practical advice on screen use, meals, low-threshold exercise, and stress management.",
              },
            ]}
          />
        </div>
        <div className="split-layout">
          <article className="content-card narrative-card">
            <span className="track-tag">Feedback signal</span>
            <ul className="card-list">
              <li>
                The discussion was active and relaxed, especially when students
                compared personal routines rather than only listening to slides.
              </li>
              <li>
                Some technical English terms were still difficult, which made
                vocabulary support a real design need rather than decoration.
              </li>
              <li>
                Good practical tips stayed inside small-group conversations, so
                the next version should capture and redistribute them.
              </li>
            </ul>
          </article>
          <article className="content-card narrative-card">
            <span className="track-tag">Iteration plan</span>
            <ul className="card-list">
              <li>
                Use simpler animations, games, or matching tasks before
                introducing endocrine vocabulary.
              </li>
              <li>
                Publish a zero-background preview post before the activity so
                participants arrive with shared terms.
              </li>
              <li>
                Prepare a bilingual glossary and turn the fragmented discussion
                output into a short activity handbook.
              </li>
            </ul>
          </article>
        </div>
        <EducationGallery
          title="English Corner evidence photos"
          items={englishGallery}
        />
      </section>

      <section id="iteration" className="story-section">
        <div className="section-heading">
          <h2>What this teaches the project team</h2>
          <p>
            These activities do not claim that public outreach changed a wet-lab
            construct. Their value is different: they test whether
            steroid-related science can be explained responsibly, whether health
            claims stay understandable, and whether the audience can ask
            questions that improve the next communication cycle.
          </p>
        </div>
        <div className="story-band">
          <div>
            <span className="story-band-label">Communication requirement</span>
            <h2 className="story-band-title">
              Plain language is now part of responsible platform design.
            </h2>
          </div>
          <p className="story-band-text">
            The next Education materials should keep scientific accuracy while
            giving each audience the vocabulary, interaction time, and examples
            they need to respond.
          </p>
        </div>
      </section>

      <section id="references" className="story-section story-section-last">
        <ReferenceBlock
          title="Education and responsible engagement references"
          items={educationReferences}
        />
      </section>
    </>
  );
}
