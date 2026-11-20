import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bug,
  Check,
  Code2,
  MessageCircle,
  Play,
  Radio,
  Sparkles,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Brand } from "../../components/shared/Brand";
import { ThemeToggle } from "../../components/ui/ThemeToggle";

const features = [
  {
    icon: Users,
    title: "Work in the same room",
    description:
      "Share a coding space, follow each other's thinking, and move from idea to working code together.",
    number: "01",
  },
  {
    icon: MessageCircle,
    title: "Talk through the tricky bits",
    description:
      "Keep the conversation beside the code. No context lost between another tab and another call.",
    number: "02",
  },
  {
    icon: Bug,
    title: "Think like a tester",
    description:
      "Predict which cases will fail before you run them. Compare your instincts with what the code does.",
    number: "03",
  },
];

function CodePreview() {
  return (
    <div
      className="preview-window"
      aria-label="Illustration of a shared code room"
    >
      <div className="preview-window__titlebar">
        <div className="window-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <span className="preview-window__room">
          <Radio size={13} /> room / edge-cases
        </span>
        <span className="preview-live">
          <i /> Live
        </span>
      </div>
      <div className="preview-window__body">
        <div className="code-pane">
          <div className="code-pane__tabs">
            <span className="code-tab">
              <Code2 size={13} /> solution.ts
            </span>
            <span className="code-language">TypeScript</span>
          </div>
          <div className="code-lines" aria-hidden="true">
            <div>
              <i>1</i>
              <span>
                <b>function</b> firstDuplicate(values: <em>number</em>[]) {"{"}
              </span>
            </div>
            <div>
              <i>2</i>
              <span>
                {" "}
                <b>const</b> seen = <b>new</b> <em>Set</em>&lt;<em>number</em>
                &gt;();
              </span>
            </div>
            <div>
              <i>3</i>
              <span />
            </div>
            <div className="code-line--focus">
              <i>4</i>
              <span>
                {" "}
                <b>for</b> (<b>const</b> value <b>of</b> values) {"{"}
              </span>
            </div>
            <div>
              <i>5</i>
              <span>
                {" "}
                <b>if</b> (seen.has(value)) {"{"}
              </span>
            </div>
            <div>
              <i>6</i>
              <span>
                {" "}
                <b>return</b> value;
              </span>
            </div>
            <div>
              <i>7</i>
              <span> {"}"}</span>
            </div>
            <div>
              <i>8</i>
              <span> seen.add(value);</span>
            </div>
            <div>
              <i>9</i>
              <span> {"}"}</span>
            </div>
            <div>
              <i>10</i>
              <span>
                {" "}
                <b>return</b> <em>null</em>;
              </span>
            </div>
            <div>
              <i>11</i>
              <span>{"}"}</span>
            </div>
          </div>
          <div className="collab-cursor collab-cursor--one">
            <span /> Maya
          </div>
          <div className="collab-cursor collab-cursor--two">
            <span /> alex
          </div>
        </div>
        <div className="preview-side">
          <div className="preview-side__heading">
            <span>People here</span>
            <span className="presence-count">3</span>
          </div>
          <div className="person-row">
            <span className="mini-avatar mini-avatar--lime">M</span>
            <span>
              <b>Maya Chen</b>
              <small>Editing</small>
            </span>
            <i className="presence-dot" />
          </div>
          <div className="person-row">
            <span className="mini-avatar mini-avatar--blue">A</span>
            <span>
              <b>alex rivera</b>
              <small>Reviewing</small>
            </span>
            <i className="presence-dot" />
          </div>
          <div className="person-row">
            <span className="mini-avatar mini-avatar--orange">J</span>
            <span>
              <b>Jordan Lee</b>
              <small>In the room</small>
            </span>
            <i className="presence-dot" />
          </div>
          <div className="preview-chat">
            <div className="preview-side__heading">
              <span>Room chat</span>
              <MessageCircle size={13} />
            </div>
            <p>
              <b>Maya</b> What if the array is empty?
            </p>
            <p>
              <b>alex</b> Good catch — let's cover it.
            </p>
            <div className="chat-input-preview">
              Message the room… <ArrowUpRight size={13} />
            </div>
          </div>
        </div>
      </div>
      <div className="preview-window__footer">
        <span>
          <span className="status-dot" /> All changes saved
        </span>
        <span>
          main <ArrowDownRight size={12} />
        </span>
        <span className="preview-run">
          <Play size={11} fill="currentColor" /> Run code
        </span>
      </div>
    </div>
  );
}

export function LandingPage() {
  return (
    <main className="landing">
      <header className="landing-nav container">
        <Brand />
        <nav className="landing-nav__links" aria-label="Main navigation">
          <a href="#why-syncode">Why Syncode</a>
          <a href="#how-it-works">How it works</a>
        </nav>
        <div className="landing-nav__actions">
          <ThemeToggle />
          <Link className="nav-login" to="/login">
            Log in
          </Link>
          <Link className="button button--primary button--sm" to="/register">
            Get started <ArrowRight size={15} />
          </Link>
        </div>
      </header>

      <section className="hero container">
        <div className="hero__copy">
          <div className="hero-kicker">
            <span /> A better way to solve things together
          </div>
          <h1>
            Good code gets
            <br />
            better <span>together.</span>
          </h1>
          <p className="hero__description">
            A shared space to write, debug, and think out loud. Bring your
            people, bring the edge cases.
          </p>
          <div className="hero__actions">
            <Link className="button button--primary button--lg" to="/register">
              Find your flow <ArrowRight size={17} />
            </Link>
            <a className="hero__text-link" href="#how-it-works">
              See how it works <ArrowDownRight size={15} />
            </a>
          </div>
          <div className="hero-proof">
            <div className="hero-proof__avatars" aria-hidden="true">
              <span>M</span>
              <span>A</span>
              <span>J</span>
              <span>+</span>
            </div>
            <p>
              <strong>Better problems, solved together.</strong>
              <br />
              Made for the people you like to build with.
            </p>
          </div>
        </div>
        <div className="hero__visual">
          <div className="visual-orbit visual-orbit--one" />
          <div className="visual-orbit visual-orbit--two" />
          <CodePreview />
          <div className="hero-float hero-float--top">
            <Sparkles size={14} /> Shared context, not screen share
          </div>
          <div className="hero-float hero-float--bottom">
            <Check size={14} /> The edge case you almost missed
          </div>
        </div>
      </section>

      <div className="ticker">
        <div className="container ticker__inner">
          <span>Less context switching</span>
          <i />
          <span>More shared thinking</span>
          <i />
          <span>Better bugs, caught earlier</span>
          <i />
          <span>Built for the whole session</span>
        </div>
      </div>

      <section className="section container" id="why-syncode">
        <div className="section-heading">
          <p className="eyebrow">A room for the whole process</p>
          <h2>
            From “what if?”
            <br />
            to <span>“there it is.”</span>
          </h2>
          <p>
            Great debugging isn't a solo sport. Syncode keeps the code,
            conversation, and curiosity in one place.
          </p>
        </div>
        <div className="feature-grid">
          {features.map(({ icon: Icon, title, description, number }) => (
            <article className="feature-card" key={number}>
              <div className="feature-card__top">
                <span className="feature-icon">
                  <Icon size={18} />
                </span>
                <span>{number}</span>
              </div>
              <h3>{title}</h3>
              <p>{description}</p>
              <span className="feature-card__line" />
            </article>
          ))}
        </div>
      </section>

      <section className="prediction-section" id="how-it-works">
        <div className="container prediction-layout">
          <div className="prediction-copy">
            <p className="eyebrow">
              <Bug size={14} /> A little friendly pressure
            </p>
            <h2>
              Read the code.
              <br />
              Call the <span>bug.</span>
            </h2>
            <p>
              Before you hit run, make your prediction. Which test case breaks?
              See how your instincts stack up, and learn to spot the boundary
              you missed.
            </p>
            <Link to="/register" className="inline-link">
              Explore Bug Prediction <ArrowRight size={16} />
            </Link>
          </div>
          <div className="prediction-card">
            <div className="prediction-card__top">
              <span className="prediction-tag">
                <Bug size={13} /> BUG PREDICTION
              </span>
              <span>01 / 04</span>
            </div>
            <h3>Which input breaks this function?</h3>
            <pre>
              <code>
                <span>function</span> average(nums) {"{"}
                <br /> <span>return</span> nums.reduce(<i>(a, b) =&gt; a + b</i>
                , 0)
                <br /> / nums.length;
                <br />
                {"}"}
              </code>
            </pre>
            <div className="prediction-choices">
              <button type="button" disabled>
                <kbd>A</kbd> [2, 4, 6]
              </button>
              <button type="button" disabled>
                <kbd>B</kbd> []
              </button>
              <button type="button" disabled>
                <kbd>C</kbd> [0, 0, 0]
              </button>
            </div>
            <p className="prediction-card__note">
              A preview of the challenge — not interactive yet.
            </p>
          </div>
        </div>
      </section>

      <section className="how-section container">
        <div className="how-section__intro">
          <p className="eyebrow">Simple by design</p>
          <h2>
            Pick a problem.
            <br />
            Bring your people.
          </h2>
        </div>
        <div className="steps">
          <div className="step">
            <span>01</span>
            <div>
              <h3>Make a room</h3>
              <p>
                Start with a bug, a kata, or a question that won't leave you
                alone.
              </p>
            </div>
          </div>
          <div className="step">
            <span>02</span>
            <div>
              <h3>Think out loud</h3>
              <p>
                Code together and keep the conversation close to the problem.
              </p>
            </div>
          </div>
          <div className="step">
            <span>03</span>
            <div>
              <h3>See what you missed</h3>
              <p>
                Run it, compare predictions, and leave with a sharper instinct.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="closing-cta container">
        <div>
          <p className="eyebrow">Your next “aha” is a team sport</p>
          <h2>
            Better together.
            <br />
            <span>Obviously.</span>
          </h2>
        </div>
        <Link className="button button--primary button--lg" to="/register">
          Get started <ArrowRight size={17} />
        </Link>
        <span className="closing-cta__orb" aria-hidden="true" />
      </section>

      <footer className="landing-footer container">
        <Brand compact />
        <span>Think together. Debug smarter.</span>
        <div>
          <Link to="/login">Log in</Link>
          <Link to="/register">Get started</Link>
          <span>© 2026 Syncode</span>
        </div>
      </footer>
    </main>
  );
}
