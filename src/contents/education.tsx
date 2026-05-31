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
      "A fifth-grade class connected sunlight, vitamin D, steroid precursors, and microbial factories through experiments, drawing, and questionnaires.",
    metric: "Loop dossier 01",
    href: "#primary-school",
  },
  {
    status: "May 15",
    title: "English Corner: From Online Tips to Daily Habits",
    description:
      "A bilingual workshop used sleep, cortisol, melatonin, insulin, ghrelin, and leptin to turn online health advice into science-based routines.",
    metric: "Loop dossier 02",
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

const activityDossiers = [
  {
    id: "primary-school",
    index: "01",
    date: "May 12",
    title: "Sunshine Health Code at Helie Primary School",
    subtitle:
      "A 45-minute health science class for fifth-grade students in Wuxi.",
    cover: primarySynbioClassroomUrl,
    coverAlt:
      "A team member explaining synthetic biology during the Helie Primary School outreach class.",
    audience: "Grade-five students at Wuxi Helie Central Primary School.",
    purpose:
      "We wanted to test whether young students could connect sunlight, vitamin D, steroid precursors, and microbial factories through familiar daily-health examples.",
    summary:
      "The activity started with a pre-class questionnaire, moved into UVB beads and glass-barrier experiments, and ended with post-class feedback and drawing tasks.",
    tags: [
      "Primary school",
      "Questionnaire",
      "UVB experiment",
      "Drawing feedback",
    ],
    loop: [
      {
        label: "Who we contacted",
        text: "Grade-five students, because they are old enough to discuss health habits but still need concrete, visible examples before abstract pathway language.",
      },
      {
        label: "Why we contacted them",
        text: "The team needed to know whether steroid-related health science could be translated responsibly for a young public audience instead of staying inside expert language.",
      },
      {
        label: "Feedback we heard",
        text: "Many students first associated vitamin D with food rather than sunlight-driven synthesis. Microbial production was also unfamiliar, while the UVB experiment drew the clearest participation.",
      },
      {
        label: "What changed",
        text: "The next version will keep more time for student-operated experiments, split the same topic into age-specific scripts, and explain sunlight plus body conversion before introducing pathway terms.",
      },
      {
        label: "Result / next plan",
        text: "The primary-school script now becomes the simplest layer of a reusable outreach kit, with later community talks and short social-media explanations planned around the same daily-health doorway.",
      },
      {
        label: "Evidence materials",
        text: "Pre-class questionnaire, post-class questionnaire, activity slides, classroom photos, and student interaction records from the HP collection.",
      },
    ],
    notes: [
      "The lesson followed the journey from sunlight to skin, liver, kidney, active vitamin D, and calcium absorption.",
      "UVB beads and a glass barrier made the message about glass-filtered sunlight visible instead of only verbal.",
      "The microbial factory section helped students imagine engineered microorganisms as practical producers of useful nutritional building blocks.",
    ],
    galleryTitle: "Primary-school evidence photos",
    gallery: primaryGallery,
  },
  {
    id: "english-corner",
    index: "02",
    date: "May 15",
    title: "English Corner: From Online Tips to Daily Habits",
    subtitle:
      "A bilingual university workshop linking everyday routines to endocrine signals.",
    cover: englishCornerWorkshopUrl,
    coverAlt:
      "University students working together during the English Corner health workshop.",
    audience:
      "Jiangnan University students and international participants in a small English Corner setting.",
    purpose:
      "We used bilingual discussion to learn whether students could connect online health advice with steroid-related hormones and then translate the science into realistic routines.",
    summary:
      "Participants voted on daily habits, learned key hormones through English practice, discussed barriers to change, and built personal rest-day schedules.",
    tags: [
      "University",
      "Bilingual dialogue",
      "Hormone vocabulary",
      "Habit design",
    ],
    loop: [
      {
        label: "Who we contacted",
        text: "University students with mixed language backgrounds, because they frequently receive health advice online and can test whether our explanation works across both science and English vocabulary.",
      },
      {
        label: "Why we contacted them",
        text: "The project needs public communication that is accurate without becoming intimidating. English Corner let us test endocrine language in a relaxed conversation format.",
      },
      {
        label: "Feedback we heard",
        text: "Participants were most active when comparing their own routines. Some asked specific questions such as why cortisol peaks around waking, while several technical English terms still needed support.",
      },
      {
        label: "What changed",
        text: "Future workshops will add matching games or animations before vocabulary-heavy slides, provide a zero-background preview post, and prepare a bilingual glossary for recurring terms.",
      },
      {
        label: "Result / next plan",
        text: "The team will turn scattered group suggestions into a short activity handbook and adapt the same health-rhythm story for more university and community audiences.",
      },
      {
        label: "Evidence materials",
        text: "English questionnaire, workshop slides, voting photos, presenter photos, group activity photos, and the health schedule design task.",
      },
    ],
    notes: [
      "The workshop began with questions about late nights, caffeine, saved online tips, meals, outdoor time, and exercise.",
      "Melatonin, cortisol, insulin, ghrelin, leptin, and serotonin were introduced through the daily choices participants already recognized.",
      "Small-group discussion produced practical suggestions, but the next version needs a better capture method so useful ideas are not lost.",
    ],
    galleryTitle: "English Corner evidence photos",
    gallery: englishGallery,
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

function ActivityDossier({
  activity,
}: {
  activity: (typeof activityDossiers)[number];
}) {
  return (
    <section id={activity.id} className="story-section activity-dossier">
      <div className="activity-dossier-header">
        <div className="activity-dossier-copy">
          <div className="activity-dossier-meta">
            <span>{activity.index}</span>
            <strong>{activity.date}</strong>
          </div>
          <span className="section-kicker">Activity dossier</span>
          <h2>{activity.title}</h2>
          <p>{activity.subtitle}</p>
          <p>{activity.summary}</p>
          <div className="activity-dossier-chips" aria-label="Evidence tags">
            {activity.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </div>
        <figure className="activity-dossier-cover">
          <img src={activity.cover} alt={activity.coverAlt} loading="lazy" />
          <figcaption>{activity.audience}</figcaption>
        </figure>
      </div>

      <details className="loop-dossier">
        <summary>
          <span>Loop dossier</span>
          <strong>Open detailed activity introduction</strong>
        </summary>
        <div className="loop-dossier-body">
          {activity.loop.map((item) => (
            <article className="loop-dossier-field" key={item.label}>
              <span>{item.label}</span>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </details>

      <div className="activity-notes">
        <article className="content-card narrative-card">
          <span className="track-tag">What happened</span>
          <ul className="card-list">
            {activity.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </article>
        <article className="content-card narrative-card">
          <span className="track-tag">Why it matters</span>
          <p>{activity.purpose}</p>
        </article>
      </div>

      <EducationGallery
        title={activity.galleryTitle}
        items={activity.gallery}
      />
    </section>
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

      <div className="activity-dossier-stack">
        {activityDossiers.map((activity) => (
          <ActivityDossier activity={activity} key={activity.id} />
        ))}
      </div>

      <section id="education-flow" className="story-section">
        <div className="section-shell section-shell-amber">
          <FlowDiagram
            title="Each activity now follows the same education loop"
            lead="The page keeps the event narrative short, then opens the detailed record only when readers want to inspect the evidence chain."
            variant="linear"
            steps={[
              {
                label: "Contact",
                title: "Choose an audience with a real question",
                text: "Primary-school students tested age-appropriate language; university students tested bilingual health communication.",
              },
              {
                label: "Listen",
                title: "Collect feedback during the activity",
                text: "Questionnaires, voting, discussion, drawings, and workshop outputs recorded what each audience understood or struggled with.",
              },
              {
                label: "Change",
                title: "Turn feedback into design decisions",
                text: "The team adjusted interaction time, vocabulary support, age layers, and post-activity material capture.",
              },
              {
                label: "Reuse",
                title: "Prepare the next audience",
                text: "The next outreach kit will reuse the same loop instead of treating each event as an isolated record.",
              },
            ]}
          />
        </div>
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
